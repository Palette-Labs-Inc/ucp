import { z } from "zod";

import {
  CheckoutCreateRequestSchema,
  CheckoutResponseSchema,
  CheckoutUpdateRequestSchema,
  CheckoutWithBuyerConsentCreateRequestSchema,
  CheckoutWithBuyerConsentResponseSchema,
  CheckoutWithBuyerConsentUpdateRequestSchema,
  CheckoutWithDiscountCreateRequestSchema,
  CheckoutWithDiscountResponseSchema,
  CheckoutWithDiscountUpdateRequestSchema,
  CheckoutWithFulfillmentCreateRequestSchema,
  CheckoutWithFulfillmentResponseSchema,
  CheckoutWithFulfillmentUpdateRequestSchema,
  OrderSchema,
  PaymentCredentialSchema,
  PaymentInstrumentSchema,
  PostalAddressSchema,
} from "./spec_generated";

export const ExtendedPaymentCredentialSchema = PaymentCredentialSchema.extend({
  token: z.string().optional(),
});
export type ExtendedPaymentCredential = z.infer<
  typeof ExtendedPaymentCredentialSchema
>;

export const LocalprotocolAuthCaptureInstrumentSchema = z.object({
  id: z.string(),
  handler_id: z.string(),
  type: z.literal("localprotocol_auth_capture"),
  operator: z.string(),
  payer: z.string(),
  receiver: z.string(),
  token: z.string(),
  amount: z.union([z.string(), z.number().int()]),
  max_amount: z.union([z.string(), z.number().int()]),
  pre_approval_expiry: z.number().int(),
  authorization_expiry: z.number().int(),
  refund_expiry: z.number().int(),
  min_fee_bps: z.number().int(),
  max_fee_bps: z.number().int(),
  fee_receiver: z.string(),
  salt: z.union([z.string(), z.number().int()]),
  token_collector: z.string(),
  collector_data: z.string(),
  authorization_id: z.string(),
  authorize_tx_hash: z.string(),
  chain_id: z.number().int(),
  escrow_contract: z.string(),
  merchant_payout_address: z.string().optional(),
  billing_address: PostalAddressSchema.optional(),
  credential: PaymentCredentialSchema.optional(),
});
export type LocalprotocolAuthCaptureInstrument = z.infer<
  typeof LocalprotocolAuthCaptureInstrumentSchema
>;

export const ExtendedPaymentInstrumentSchema = z.union([
  PaymentInstrumentSchema,
  LocalprotocolAuthCaptureInstrumentSchema,
]);
export type ExtendedPaymentInstrument = z.infer<
  typeof ExtendedPaymentInstrumentSchema
>;

export const ExtendedPaymentDataSchema = z.object({
  payment_data: ExtendedPaymentInstrumentSchema,
});
export type ExtendedPaymentData = z.infer<typeof ExtendedPaymentDataSchema>;

export const PlatformConfigSchema = z.object({
  webhook_url: z.string().url().optional(),
});
export type PlatformConfig = z.infer<typeof PlatformConfigSchema>;

export const ExtendedCheckoutResponseSchema = CheckoutResponseSchema.extend(
  CheckoutWithFulfillmentResponseSchema.pick({ fulfillment: true }).shape
)
  .extend(CheckoutWithDiscountResponseSchema.pick({ discounts: true }).shape)
  .extend(CheckoutWithBuyerConsentResponseSchema.pick({ buyer: true }).shape)
  .extend({
    order_id: z.string().optional(),
    order_permalink_url: z.string().optional(),
    platform: PlatformConfigSchema.optional(),
  });
export type ExtendedCheckoutResponse = z.infer<
  typeof ExtendedCheckoutResponseSchema
>;

export const ExtendedCheckoutCreateRequestSchema =
  CheckoutCreateRequestSchema.extend(
    CheckoutWithFulfillmentCreateRequestSchema.pick({ fulfillment: true }).shape
  )
    .extend(
      CheckoutWithDiscountCreateRequestSchema.pick({ discounts: true }).shape
    )
    .extend(
      CheckoutWithBuyerConsentCreateRequestSchema.pick({ buyer: true }).shape
    );
export type ExtendedCheckoutCreateRequest = z.infer<
  typeof ExtendedCheckoutCreateRequestSchema
>;

export const ExtendedCheckoutUpdateRequestSchema =
  CheckoutUpdateRequestSchema.extend(
    CheckoutWithFulfillmentUpdateRequestSchema.pick({ fulfillment: true }).shape
  )
    .extend(
      CheckoutWithDiscountUpdateRequestSchema.pick({ discounts: true }).shape
    )
    .extend(
      CheckoutWithBuyerConsentUpdateRequestSchema.pick({ buyer: true }).shape
    );
export type ExtendedCheckoutUpdateRequest = z.infer<
  typeof ExtendedCheckoutUpdateRequestSchema
>;

export const OrderUpdateSchema = OrderSchema;
export type OrderUpdate = z.infer<typeof OrderUpdateSchema>;
