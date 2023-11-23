import { OrderStatus } from "../types.ts";
import { Stripe } from "stripe";
import { createClient } from "supabase";
import { getCurrentTimeInSupabaseFormat } from "../utils.ts";

const stripeAPIKey = Deno.env.get("STRIPE_API_KEY")!;
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const stripe = new Stripe(stripeAPIKey, {
  apiVersion: "2022-11-15",
  httpClient: Stripe.createFetchHttpClient(),
});

const supabase = createClient(
  supabaseUrl,
  supabaseKey,
);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "apikey, X-Client-Info, Authorization",
      },
    });
  }

  const { course_id } = await req.json();

  const token = req.headers.get("Authorization")!.replace("Bearer ", "");
  const { user } = (await supabase.auth.getUser(token)).data;

  if (!user) {
    throw new Error("User not found");
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("user_id", user.id)
    .eq("course_id", course_id)
    .gte("end_date", getCurrentTimeInSupabaseFormat())
    .or("revoked.is.null, revoked.is.FALSE");

  if (subscription && subscription.length > 0) {
    console.log("Subscription Already Exists for User : ", user.id);
    return new Response(
      JSON.stringify({ error: "Subscription Already Exists" }),
      {
        status: 400,
      },
    );
  }

  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .eq("id", course_id);

  if (!courses || courses.length < 1) {
    return new Response(
      JSON.stringify({ error: "Course Does not Exists or Is not available" }),
      {
        status: 400,
      },
    );
  }
  const course = courses[0];

  const amount = course.amount;
  const amountCurrency = course.currency;

  const paymentIntent = await stripe.paymentIntents.create({
    // customer: stripe_customer_id, We should not care about customers as we just store the order details in our db.
    payment_method_types: ["card"],
    amount: Math.round(amount * 100), // do note that stripe talks about currency in cents
    currency: amountCurrency,
  });

  const { data: orders } = await supabase
    .from("orders")
    .insert([
      {
        user_id: user.id,
        stripe_payment_intent_id: paymentIntent.id,
        course_id: course_id,
        amount: amount,
        currency: amountCurrency,
        status: OrderStatus.CREATED,
      },
    ])
    .select();

  if (!orders || orders.length < 1) {
    throw Error("Error While Creating Order");
  }

  return Response.json({
    order: orders[0],
    clientSecret: paymentIntent.client_secret,
  }, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "apikey, X-Client-Info, Authorization",
      "Content-Type": "application/json",
    },
  });
});

// supabase functions deploy create-stripe-payment
