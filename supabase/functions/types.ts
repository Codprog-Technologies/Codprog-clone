export type WebhookData = {
  id: string;
  object: string;
  api_version: string;
  created: number;
  data: {
    // deno-lint-ignore no-explicit-any
    object: any;
  };
  livemode: boolean;
  pending_webhooks: number;
  request: {
    id: string;
    idempotency_key: string;
  };
  type: string;
};

export type PaymentIntentPayload = {
  id: string;
  object: string;
  amount: number;
  amount_capturable: number;
  amount_details: {
    tip: {};
  };
  amount_received: number;
  application: null | string;
  application_fee_amount: null | number;
  automatic_payment_methods: null | string;
  canceled_at: null | string;
  cancellation_reason: null | string;
  capture_method: string;
  client_secret: string;
  confirmation_method: string;
  created: number;
  currency: string;
  customer: null | string;
  description: null | string;
  invoice: null | string;
  last_payment_error: null | string;
  latest_charge: null | string;
  livemode: boolean;
  metadata: Record<string, unknown>;
  next_action: null | string;
  on_behalf_of: null | string;
  payment_method: null | string;
  payment_method_configuration_details: null | string;
  payment_method_options: {
    card: {
      installments: null | string;
      mandate_options: null | string;
      network: null | string;
      request_three_d_secure: string;
    };
  };
  payment_method_types: string[];
  processing: null | string;
  receipt_email: null | string;
  review: null | string;
  setup_future_usage: null | string;
  shipping: null | string;
  source: null | string;
  statement_descriptor: null | string;
  statement_descriptor_suffix: null | string;
  status: string;
  transfer_data: null | string;
  transfer_group: null | string;
};

export enum OrderStatus {
  CREATED = "CREATED",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED", // Both for user cancelled or Payment Failure
  CHARGEBACK = "CHARGEBACK",
  // currently no use case for refunds
}
