import Stripe from "stripe";
import { createClient } from "supabase";
import { OrderStatus, PaymentIntentPayload, WebhookData } from "../types.ts";
import {
  getCurrentTimeInSupabaseFormat,
  getDateInSupabaseFormat,
} from "../utils.ts";

const stripeAPIKey = Deno.env.get("STRIPE_API_KEY")!;
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SIGNING_SECRET")!;
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabaseClient = createClient(
  supabaseUrl,
  supabaseKey,
);

const stripe = new Stripe(stripeAPIKey, {
  apiVersion: "2022-11-15",
  httpClient: Stripe.createFetchHttpClient(),
});

Deno.serve(async (request) => {
  const signature = request.headers.get("Stripe-Signature") as string;

  const body = await request.text();
  let receivedEvent;
  try {
    receivedEvent = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret,
      undefined,
    );

    if (isHandleable(receivedEvent.type)) {
      const paymentIntentId = getPaymentIntentObjId(receivedEvent);
      const { data: orders } = await supabaseClient
        .from("orders")
        .select("*")
        .eq("stripe_payment_intent_id", paymentIntentId);
      if (!orders || orders.length < 1) {
        throw Error("Order Details not present in DB!");
      }
      const order = orders[0];
      if (receivedEvent.type.startsWith("payment_intent")) {
        await handlePaymentIntentUpdate(
          order,
          receivedEvent.data.object as PaymentIntentPayload,
          receivedEvent.type,
        );
      } else if (receivedEvent.type.startsWith("charge.dispute")) {
        await handleDispute(
          order,
          receivedEvent.data.object,
          receivedEvent.type,
        );
      } else {
        throw Error("Unhandleable Stripe Event !");
      }
    }
  } catch (err) {
    console.log(err);
    return new Response(err.message, { status: 500 });
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
});

function getPaymentIntentObjId(data: WebhookData) {
  if (data.data.object.object == "payment_intent") {
    return data.data.object.id;
  } else if (data.data.object.payment_intent) {
    return data.data.object.payment_intent;
  } else {
    throw Error("Payment Intent Id not found");
  }
}

function isHandleable(eventType: string) {
  const paymentIntentEventsToHandle: string[] = [
    "payment_intent.succeeded",
    "payment_intent.payment_failed",
    "payment_intent.canceled",
    "payment_intent.processing",
  ];
  const disputeEventsToHandle: string[] = [
    "charge.dispute.created",
    "charge.dispute.closed",
  ];
  return paymentIntentEventsToHandle.includes(eventType) ||
    disputeEventsToHandle.includes(eventType);
}

async function handlePaymentIntentUpdate(
  order,
  paymentIntent: PaymentIntentPayload,
  eventType: string,
) {
  switch (eventType) {
    case "payment_intent.succeeded":
      console.log("Processing Payment Intent Success Event");
      await handlePaymentIntentSuccess(order, paymentIntent);
      break;
    case "payment_intent.payment_failed":
    case "payment_intent.canceled":
      console.log("Processing payment failure...");
      await handlePaymentIntentFailed(order, paymentIntent);
      break;
    case "payment_intent.processing":
      console.log("Payment Intent Processing...");
      break;
    default:
      console.log("Unknown Event type");
      break;
  }
}

async function handleDispute(order, dispute: any, eventType: string) {
  switch (eventType) {
    case "charge.dispute.created":
      console.log("Processing Dispute Created Event");
      await handleDisputeCreated(order, dispute);
      break;
    case "charge.dispute.closed":
      console.log("Processing Dispute Closed Event");
      await handleDisputeClosed(order, dispute);
      break;
    default:
      console.log("Unknown Event type");
      break;
  }
}

async function handlePaymentIntentSuccess(order, PaymentIntentPayload) {
  // update order status and create subscription
  // In ideal cases this should be wrapped in transaction
  const { error: orderUpdateError } = await supabaseClient
    .from("orders")
    .update({ status: OrderStatus.COMPLETED })
    .eq("id", order.id)
    .select();
  if (orderUpdateError) {
    throw Error(orderUpdateError.message);
  }
  const { error: subscriptionInsertError } = await supabaseClient
    .from("subscriptions")
    .insert({
      order_id: order.id,
      user_id: order.user_id,
      course_id: order.course_id,
      start_date: getCurrentTimeInSupabaseFormat(),
      end_date: getDateInSupabaseFormat(getEndDate()),
    })
    .eq("id", order.id)
    .select();
  if (subscriptionInsertError) {
    throw Error(subscriptionInsertError.message);
  }
}

async function handlePaymentIntentFailed(order, PaymentIntentPayload) {
  // update order status
  const { error: orderUpdateError } = await supabaseClient
    .from("orders")
    .update({ status: OrderStatus.FAILED })
    .eq("id", order.id)
    .select();
  if (orderUpdateError) {
    throw Error(orderUpdateError.message);
  }
}

async function handleDisputeCreated(order, dispute) {
  // just mark ever_disputed flag as true
  const { error: orderUpdateError } = await supabaseClient
    .from("orders")
    .update({ ever_disputed: true })
    .eq("id", order.id)
    .select();
  if (orderUpdateError) {
    throw Error(orderUpdateError.message);
  }
}

async function handleDisputeClosed(order, dispute) {
  switch (dispute.status) {
    case "lost":
      await handleLostDispute(order);
      break;
    case "warning_closed":
    case "won":
      console.log("Dispute Won, Nothing to update in DB");
      break;
    default:
      console.log("Unknown Dispute Status");
      break;
  }
}

async function handleLostDispute(order) {
  // these 2 queries should ideally be in transactional block
  const { error: orderUpdateError } = await supabaseClient
    .from("orders")
    .update({ status: OrderStatus.CHARGEBACK })
    .eq("id", order.id)
    .select();
  if (orderUpdateError) {
    throw Error(orderUpdateError.message);
  }
  const { error: supbscriptionUpdateError } = await supabaseClient
    .from("subscriptions")
    .update({ revoked: true })
    .eq("order_id", order.id)
    .select();
  if (supbscriptionUpdateError) {
    throw Error(supbscriptionUpdateError.message);
  }
}

function getEndDate() {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  return date;
}

// supabase functions deploy stripe-hooks  --import-map import_map.json --no-verify-jwt
