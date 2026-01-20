import * as z from "zod";

// Key usage. Should be 'sig' for signing keys.

export const UseSchema = z.enum([
    "enc",
    "sig",
]);
export type Use = z.infer<typeof UseSchema>;

// The type of card number. Network tokens are preferred with fallback to FPAN. See PCI
// Scope for more details.

export const CardNumberTypeSchema = z.enum([
    "dpan",
    "fpan",
    "network_token",
]);
export type CardNumberType = z.infer<typeof CardNumberTypeSchema>;

// A URI pointing to a schema definition (e.g., JSON Schema) used to validate the structure
// of the instrument object.

export const CardPaymentInstrumentTypeSchema = z.enum([
    "card",
]);
export type CardPaymentInstrumentType = z.infer<typeof CardPaymentInstrumentTypeSchema>;

// Type of total categorization.

export const TotalResponseTypeSchema = z.enum([
    "discount",
    "fee",
    "fulfillment",
    "items_discount",
    "subtotal",
    "tax",
    "total",
]);
export type TotalResponseType = z.infer<typeof TotalResponseTypeSchema>;

// Content format, default = plain.

export const ContentTypeSchema = z.enum([
    "markdown",
    "plain",
]);
export type ContentType = z.infer<typeof ContentTypeSchema>;

// Declares who resolves this error. 'recoverable': agent can fix via API.
// 'requires_buyer_input': merchant requires information their API doesn't support
// collecting programmatically (checkout incomplete). 'requires_buyer_review': buyer must
// authorize before order placement due to policy, regulatory, or entitlement rules
// (checkout complete). Errors with 'requires_*' severity contribute to 'status:
// requires_escalation'.

export const SeveritySchema = z.enum([
    "recoverable",
    "requires_buyer_input",
    "requires_buyer_review",
]);
export type Severity = z.infer<typeof SeveritySchema>;


export const MessageTypeSchema = z.enum([
    "error",
    "info",
    "warning",
]);
export type MessageType = z.infer<typeof MessageTypeSchema>;

// Checkout state indicating the current phase and required action. See Checkout Status
// lifecycle documentation for state transition details.

export const CheckoutWithMenuModifiersResponseStatusSchema = z.enum([
    "canceled",
    "complete_in_progress",
    "completed",
    "incomplete",
    "ready_for_complete",
    "requires_escalation",
]);
export type CheckoutWithMenuModifiersResponseStatus = z.infer<typeof CheckoutWithMenuModifiersResponseStatusSchema>;

// Media type discriminator.

export const MediaTypeSchema = z.enum([
    "image",
    "model_3d",
    "video",
]);
export type MediaType = z.infer<typeof MediaTypeSchema>;

// Required fulfillment method type for the merchant.
//
// Fulfillment method type.
//
// Fulfillment method type this availability applies to.

export const FulfillmentMethodElementSchema = z.enum([
    "pickup",
    "shipping",
]);
export type FulfillmentMethodElement = z.infer<typeof FulfillmentMethodElementSchema>;

// Distance unit.

export const UnitSchema = z.enum([
    "km",
    "mi",
]);
export type Unit = z.infer<typeof UnitSchema>;

// Delivery status.

export const DeliveryStatusSchema = z.enum([
    "canceled",
    "delivered",
    "dropoff",
    "failed",
    "pending",
    "pickup",
    "pickup_complete",
    "returned",
]);
export type DeliveryStatus = z.infer<typeof DeliveryStatusSchema>;

// Error codes specific to AP2 mandate verification.

export const Ap2ErrorCodeSchema = z.enum([
    "agent_missing_key",
    "mandate_expired",
    "mandate_invalid_signature",
    "mandate_required",
    "mandate_scope_mismatch",
    "merchant_authorization_invalid",
    "merchant_authorization_missing",
]);
export type Ap2ErrorCode = z.infer<typeof Ap2ErrorCodeSchema>;

// Allocation method. 'each' = applied independently per item. 'across' = split
// proportionally by value.

export const MethodSchema = z.enum([
    "across",
    "each",
]);
export type Method = z.infer<typeof MethodSchema>;

// Adjustment status.

export const AdjustmentStatusSchema = z.enum([
    "completed",
    "failed",
    "pending",
]);
export type AdjustmentStatus = z.infer<typeof AdjustmentStatusSchema>;

// Delivery method type (shipping, pickup, digital).

export const MethodTypeSchema = z.enum([
    "digital",
    "pickup",
    "shipping",
]);
export type MethodType = z.infer<typeof MethodTypeSchema>;

// Derived status: fulfilled if quantity.fulfilled == quantity.total, partial if
// quantity.fulfilled > 0, otherwise processing.

export const LineItemStatusSchema = z.enum([
    "fulfilled",
    "partial",
    "processing",
]);
export type LineItemStatus = z.infer<typeof LineItemStatusSchema>;


export const MessageErrorTypeSchema = z.enum([
    "error",
]);
export type MessageErrorType = z.infer<typeof MessageErrorTypeSchema>;


export const MessageInfoTypeSchema = z.enum([
    "info",
]);
export type MessageInfoType = z.infer<typeof MessageInfoTypeSchema>;


export const MessageWarningTypeSchema = z.enum([
    "warning",
]);
export type MessageWarningType = z.infer<typeof MessageWarningTypeSchema>;

export const PaymentHandlerResponseSchema = z.object({
    "config": z.record(z.string(), z.any()),
    "config_schema": z.string(),
    "id": z.string(),
    "instrument_schemas": z.array(z.string()),
    "name": z.string(),
    "spec": z.string(),
    "version": z.string(),
});
export type PaymentHandlerResponse = z.infer<typeof PaymentHandlerResponseSchema>;

export const SigningKeySchema = z.object({
    "alg": z.string().optional(),
    "crv": z.string().optional(),
    "e": z.string().optional(),
    "kid": z.string(),
    "kty": z.string(),
    "n": z.string().optional(),
    "use": UseSchema.optional(),
    "x": z.string().optional(),
    "y": z.string().optional(),
});
export type SigningKey = z.infer<typeof SigningKeySchema>;

export const CapabilityDiscoverySchema = z.object({
    "config": z.record(z.string(), z.any()).optional(),
    "extends": z.string().optional(),
    "name": z.string(),
    "schema": z.string(),
    "spec": z.string(),
    "version": z.string(),
});
export type CapabilityDiscovery = z.infer<typeof CapabilityDiscoverySchema>;

export const A2ASchema = z.object({
    "endpoint": z.string(),
});
export type A2A = z.infer<typeof A2ASchema>;

export const EmbeddedSchema = z.object({
    "schema": z.string(),
});
export type Embedded = z.infer<typeof EmbeddedSchema>;

export const McpSchema = z.object({
    "endpoint": z.string(),
    "schema": z.string(),
});
export type Mcp = z.infer<typeof McpSchema>;

export const RestSchema = z.object({
    "endpoint": z.string(),
    "schema": z.string(),
});
export type Rest = z.infer<typeof RestSchema>;

export const BaseSchema = z.object({
    "config": z.record(z.string(), z.any()).optional(),
    "extends": z.string().optional(),
    "name": z.string().optional(),
    "schema": z.string().optional(),
    "spec": z.string().optional(),
    "version": z.string().optional(),
});
export type Base = z.infer<typeof BaseSchema>;

export const BuyerClassSchema = z.object({
    "email": z.string().optional(),
    "first_name": z.string().optional(),
    "full_name": z.string().optional(),
    "last_name": z.string().optional(),
    "phone_number": z.string().optional(),
});
export type BuyerClass = z.infer<typeof BuyerClassSchema>;

export const ItemClassSchema = z.object({
    "id": z.string(),
});
export type ItemClass = z.infer<typeof ItemClassSchema>;

export const BillingAddressClassSchema = z.object({
    "address_country": z.string().optional(),
    "address_locality": z.string().optional(),
    "address_region": z.string().optional(),
    "extended_address": z.string().optional(),
    "first_name": z.string().optional(),
    "full_name": z.string().optional(),
    "last_name": z.string().optional(),
    "phone_number": z.string().optional(),
    "postal_code": z.string().optional(),
    "street_address": z.string().optional(),
});
export type BillingAddressClass = z.infer<typeof BillingAddressClassSchema>;

export const PaymentCredentialSchema = z.object({
    "type": z.string(),
    "card_number_type": CardNumberTypeSchema.optional(),
    "cryptogram": z.string().optional(),
    "cvc": z.string().optional(),
    "eci_value": z.string().optional(),
    "expiry_month": z.number().optional(),
    "expiry_year": z.number().optional(),
    "name": z.string().optional(),
    "number": z.string().optional(),
});
export type PaymentCredential = z.infer<typeof PaymentCredentialSchema>;

export const LineItemWithMenuModifiersUpdateRequestItemSchema = z.object({
    "id": z.string(),
});
export type LineItemWithMenuModifiersUpdateRequestItem = z.infer<typeof LineItemWithMenuModifiersUpdateRequestItemSchema>;

export const ItemResponseSchema = z.object({
    "id": z.string(),
    "image_url": z.string().optional(),
    "price": z.number(),
    "title": z.string(),
});
export type ItemResponse = z.infer<typeof ItemResponseSchema>;

export const TotalResponseSchema = z.object({
    "amount": z.number(),
    "display_text": z.string().optional(),
    "type": TotalResponseTypeSchema,
});
export type TotalResponse = z.infer<typeof TotalResponseSchema>;

export const LinkElementSchema = z.object({
    "title": z.string().optional(),
    "type": z.string(),
    "url": z.string(),
});
export type LinkElement = z.infer<typeof LinkElementSchema>;

export const MessageElementSchema = z.object({
    "code": z.string().optional(),
    "content": z.string(),
    "content_type": ContentTypeSchema.optional(),
    "path": z.string().optional(),
    "severity": SeveritySchema.optional(),
    "type": MessageTypeSchema,
});
export type MessageElement = z.infer<typeof MessageElementSchema>;

export const OrderClassSchema = z.object({
    "id": z.string(),
    "permalink_url": z.string(),
});
export type OrderClass = z.infer<typeof OrderClassSchema>;

export const CapabilityResponseElementSchema = z.object({
    "config": z.record(z.string(), z.any()).optional(),
    "extends": z.string().optional(),
    "name": z.string(),
    "schema": z.string().optional(),
    "spec": z.string().optional(),
    "version": z.string(),
});
export type CapabilityResponseElement = z.infer<typeof CapabilityResponseElementSchema>;

export const FlatChargeSchema = z.object({
    "amount": z.number().optional(),
    "currency_code": z.string().optional(),
});
export type FlatCharge = z.infer<typeof FlatChargeSchema>;

export const PercentageChargeSchema = z.object({
    "decimal_value": z.number().optional(),
});
export type PercentageCharge = z.infer<typeof PercentageChargeSchema>;

export const MenuHoursIntervalSchema = z.object({
    "day": z.string(),
    "from_hour": z.number(),
    "from_minute": z.number(),
    "to_hour": z.number(),
    "to_minute": z.number(),
});
export type MenuHoursInterval = z.infer<typeof MenuHoursIntervalSchema>;

export const MessageSchema = z.object({
    "code": z.string().optional(),
    "content": z.string(),
    "content_type": ContentTypeSchema.optional(),
    "path": z.string().optional(),
    "severity": SeveritySchema.optional(),
    "type": MessageTypeSchema,
});
export type Message = z.infer<typeof MessageSchema>;

export const CapabilityResponseSchema = z.object({
    "config": z.record(z.string(), z.any()).optional(),
    "extends": z.string().optional(),
    "name": z.string(),
    "schema": z.string().optional(),
    "spec": z.string().optional(),
    "version": z.string(),
});
export type CapabilityResponse = z.infer<typeof CapabilityResponseSchema>;

export const ProductDescriptionSchema = z.object({
    "html": z.string().optional(),
    "markdown": z.string().optional(),
    "plain": z.string().optional(),
});
export type ProductDescription = z.infer<typeof ProductDescriptionSchema>;

export const MaxClassSchema = z.object({
    "amount": z.number(),
    "currency": z.string(),
});
export type MaxClass = z.infer<typeof MaxClassSchema>;

export const MediaElementSchema = z.object({
    "alt_text": z.string().optional(),
    "height": z.number().optional(),
    "type": MediaTypeSchema,
    "url": z.string(),
    "width": z.number().optional(),
});
export type MediaElement = z.infer<typeof MediaElementSchema>;

export const ValueElementSchema = z.object({
    "label": z.string(),
});
export type ValueElement = z.infer<typeof ValueElementSchema>;

export const RatingClassSchema = z.object({
    "count": z.number().optional(),
    "scale_max": z.number(),
    "value": z.number(),
});
export type RatingClass = z.infer<typeof RatingClassSchema>;

export const VariantAvailabilitySchema = z.object({
    "available": z.boolean().optional(),
});
export type VariantAvailability = z.infer<typeof VariantAvailabilitySchema>;

export const VariantDescriptionSchema = z.object({
    "html": z.string().optional(),
    "markdown": z.string().optional(),
    "plain": z.string().optional(),
});
export type VariantDescription = z.infer<typeof VariantDescriptionSchema>;

export const SelectedOptionElementSchema = z.object({
    "label": z.string(),
    "name": z.string(),
});
export type SelectedOptionElement = z.infer<typeof SelectedOptionElementSchema>;

export const VariantSellerSchema = z.object({
    "links": z.array(LinkElementSchema).optional(),
    "name": z.string().optional(),
});
export type VariantSeller = z.infer<typeof VariantSellerSchema>;

export const PriceSchema = z.object({
    "amount": z.number(),
    "currency": z.string(),
});
export type Price = z.infer<typeof PriceSchema>;

export const ItemDescriptionSchema = z.object({
    "html": z.string().optional(),
    "markdown": z.string().optional(),
    "plain": z.string().optional(),
});
export type ItemDescription = z.infer<typeof ItemDescriptionSchema>;

export const MediaSchema = z.object({
    "alt_text": z.string().optional(),
    "height": z.number().optional(),
    "type": MediaTypeSchema,
    "url": z.string(),
    "width": z.number().optional(),
});
export type Media = z.infer<typeof MediaSchema>;

export const MenuItemDescriptionSchema = z.object({
    "html": z.string().optional(),
    "markdown": z.string().optional(),
    "plain": z.string().optional(),
});
export type MenuItemDescription = z.infer<typeof MenuItemDescriptionSchema>;

export const ContextSchema = z.object({
    "country": z.string().optional(),
    "postal_code": z.string().optional(),
    "region": z.string().optional(),
    "intent": z.string().optional(),
});
export type Context = z.infer<typeof ContextSchema>;

export const PriceClassSchema = z.object({
    "max": z.number().optional(),
    "min": z.number().optional(),
});
export type PriceClass = z.infer<typeof PriceClassSchema>;

export const RequestSchema = z.object({
    "cursor": z.string().optional(),
    "limit": z.number().optional(),
});
export type Request = z.infer<typeof RequestSchema>;

export const ResponseSchema = z.object({
    "cursor": z.string().optional(),
    "has_next_page": z.boolean().optional(),
    "total_count": z.number().optional(),
});
export type Response = z.infer<typeof ResponseSchema>;

export const MerchantDescriptionSchema = z.object({
    "html": z.string().optional(),
    "markdown": z.string().optional(),
    "plain": z.string().optional(),
});
export type MerchantDescription = z.infer<typeof MerchantDescriptionSchema>;

export const AllowsMultiDestinationSchema = z.object({
    "pickup": z.boolean().optional(),
    "shipping": z.boolean().optional(),
});
export type AllowsMultiDestination = z.infer<typeof AllowsMultiDestinationSchema>;

export const RetailLocationResponseSchema = z.object({
    "address": BillingAddressClassSchema.optional(),
    "id": z.string(),
    "name": z.string(),
});
export type RetailLocationResponse = z.infer<typeof RetailLocationResponseSchema>;

export const DistanceSchema = z.object({
    "unit": UnitSchema,
    "value": z.number(),
});
export type Distance = z.infer<typeof DistanceSchema>;

export const PostalAddressSchema = z.object({
    "address_country": z.string().optional(),
    "address_locality": z.string().optional(),
    "address_region": z.string().optional(),
    "extended_address": z.string().optional(),
    "first_name": z.string().optional(),
    "full_name": z.string().optional(),
    "last_name": z.string().optional(),
    "phone_number": z.string().optional(),
    "postal_code": z.string().optional(),
    "street_address": z.string().optional(),
});
export type PostalAddress = z.infer<typeof PostalAddressSchema>;

export const RadiusClassSchema = z.object({
    "unit": UnitSchema,
    "value": z.number(),
});
export type RadiusClass = z.infer<typeof RadiusClassSchema>;

export const CourierLocationSchema = z.object({
    "lat": z.number().optional(),
    "lng": z.number().optional(),
});
export type CourierLocation = z.infer<typeof CourierLocationSchema>;

export const CourierClassSchema = z.object({
    "location": CourierLocationSchema.optional(),
    "name": z.string().optional(),
    "phone_number": z.string().optional(),
    "vehicle_type": z.string().optional(),
});
export type CourierClass = z.infer<typeof CourierClassSchema>;

export const TrackingClassSchema = z.object({
    "number": z.string().optional(),
    "status": z.string().optional(),
    "updated_at": z.coerce.date().optional(),
    "url": z.string().optional(),
});
export type TrackingClass = z.infer<typeof TrackingClassSchema>;

export const FulfillmentDestinationRequestElementSchema = z.object({
    "address_country": z.string().optional(),
    "address_locality": z.string().optional(),
    "address_region": z.string().optional(),
    "extended_address": z.string().optional(),
    "first_name": z.string().optional(),
    "full_name": z.string().optional(),
    "last_name": z.string().optional(),
    "phone_number": z.string().optional(),
    "postal_code": z.string().optional(),
    "street_address": z.string().optional(),
    "id": z.string().optional(),
    "address": BillingAddressClassSchema.optional(),
    "name": z.string().optional(),
});
export type FulfillmentDestinationRequestElement = z.infer<typeof FulfillmentDestinationRequestElementSchema>;

export const GroupElementSchema = z.object({
    "selected_option_id": z.union([z.null(), z.string()]).optional(),
});
export type GroupElement = z.infer<typeof GroupElementSchema>;

export const LineItemElementSchema = z.object({
    "item": ItemClassSchema,
    "quantity": z.number(),
});
export type LineItemElement = z.infer<typeof LineItemElementSchema>;

export const LineItemClassSchema = z.object({
    "id": z.string().optional(),
    "item": LineItemWithMenuModifiersUpdateRequestItemSchema,
    "parent_id": z.string().optional(),
    "quantity": z.number(),
});
export type LineItemClass = z.infer<typeof LineItemClassSchema>;

export const FulfillmentAvailableMethodResponseSchema = z.object({
    "description": z.string().optional(),
    "fulfillable_on": z.union([z.null(), z.string()]).optional(),
    "line_item_ids": z.array(z.string()),
    "type": FulfillmentMethodElementSchema,
});
export type FulfillmentAvailableMethodResponse = z.infer<typeof FulfillmentAvailableMethodResponseSchema>;

export const FulfillmentDestinationResponseSchema = z.object({
    "address_country": z.string().optional(),
    "address_locality": z.string().optional(),
    "address_region": z.string().optional(),
    "extended_address": z.string().optional(),
    "first_name": z.string().optional(),
    "full_name": z.string().optional(),
    "last_name": z.string().optional(),
    "phone_number": z.string().optional(),
    "postal_code": z.string().optional(),
    "street_address": z.string().optional(),
    "id": z.string(),
    "address": BillingAddressClassSchema.optional(),
    "name": z.string().optional(),
});
export type FulfillmentDestinationResponse = z.infer<typeof FulfillmentDestinationResponseSchema>;

export const FulfillmentOptionResponseSchema = z.object({
    "carrier": z.string().optional(),
    "description": z.string().optional(),
    "earliest_fulfillment_time": z.coerce.date().optional(),
    "id": z.string(),
    "latest_fulfillment_time": z.coerce.date().optional(),
    "title": z.string(),
    "totals": z.array(TotalResponseSchema),
});
export type FulfillmentOptionResponse = z.infer<typeof FulfillmentOptionResponseSchema>;

export const LineItemResponseSchema = z.object({
    "id": z.string(),
    "item": ItemResponseSchema,
    "parent_id": z.string().optional(),
    "quantity": z.number(),
    "totals": z.array(TotalResponseSchema),
});
export type LineItemResponse = z.infer<typeof LineItemResponseSchema>;

export const PurpleDeliveryLocationSchema = z.object({
    "address_country": z.string().optional(),
    "address_locality": z.string().optional(),
    "address_region": z.string().optional(),
    "extended_address": z.string().optional(),
    "first_name": z.string().optional(),
    "full_name": z.string().optional(),
    "last_name": z.string().optional(),
    "phone_number": z.string().optional(),
    "postal_code": z.string().optional(),
    "street_address": z.string().optional(),
    "location": CourierLocationSchema.optional(),
});
export type PurpleDeliveryLocation = z.infer<typeof PurpleDeliveryLocationSchema>;

export const PurpleDeliveryQuoteSchema = z.object({
    "dropoff_eta": z.coerce.date().optional(),
    "expires_at": z.coerce.date(),
    "pickup_eta": z.coerce.date().optional(),
    "price": PriceSchema,
    "quote_id": z.string(),
});
export type PurpleDeliveryQuote = z.infer<typeof PurpleDeliveryQuoteSchema>;

export const CourierSchema = z.object({
    "location": CourierLocationSchema.optional(),
    "name": z.string().optional(),
    "phone_number": z.string().optional(),
    "vehicle_type": z.string().optional(),
});
export type Courier = z.infer<typeof CourierSchema>;

export const LocationSchema = z.object({
    "lat": z.number().optional(),
    "lng": z.number().optional(),
});
export type Location = z.infer<typeof LocationSchema>;

export const TrackingSchema = z.object({
    "number": z.string().optional(),
    "status": z.string().optional(),
    "updated_at": z.coerce.date().optional(),
    "url": z.string().optional(),
});
export type Tracking = z.infer<typeof TrackingSchema>;

export const Ap2CheckoutResponseObjectSchema = z.object({
    "merchant_authorization": z.string(),
});
export type Ap2CheckoutResponseObject = z.infer<typeof Ap2CheckoutResponseObjectSchema>;

export const Ap2CompleteRequestObjectSchema = z.object({
    "checkout_mandate": z.string(),
});
export type Ap2CompleteRequestObject = z.infer<typeof Ap2CompleteRequestObjectSchema>;

export const BuyerWithConsentCreateRequestConsentSchema = z.object({
    "analytics": z.boolean().optional(),
    "marketing": z.boolean().optional(),
    "preferences": z.boolean().optional(),
    "sale_of_data": z.boolean().optional(),
});
export type BuyerWithConsentCreateRequestConsent = z.infer<typeof BuyerWithConsentCreateRequestConsentSchema>;

export const CheckoutWithBuyerConsentCreateRequestBuyerSchema = z.object({
    "email": z.string().optional(),
    "first_name": z.string().optional(),
    "full_name": z.string().optional(),
    "last_name": z.string().optional(),
    "phone_number": z.string().optional(),
    "consent": BuyerWithConsentCreateRequestConsentSchema.optional(),
});
export type CheckoutWithBuyerConsentCreateRequestBuyer = z.infer<typeof CheckoutWithBuyerConsentCreateRequestBuyerSchema>;

export const BuyerWithConsentUpdateRequestConsentSchema = z.object({
    "analytics": z.boolean().optional(),
    "marketing": z.boolean().optional(),
    "preferences": z.boolean().optional(),
    "sale_of_data": z.boolean().optional(),
});
export type BuyerWithConsentUpdateRequestConsent = z.infer<typeof BuyerWithConsentUpdateRequestConsentSchema>;

export const CheckoutWithBuyerConsentUpdateRequestBuyerSchema = z.object({
    "email": z.string().optional(),
    "first_name": z.string().optional(),
    "full_name": z.string().optional(),
    "last_name": z.string().optional(),
    "phone_number": z.string().optional(),
    "consent": BuyerWithConsentUpdateRequestConsentSchema.optional(),
});
export type CheckoutWithBuyerConsentUpdateRequestBuyer = z.infer<typeof CheckoutWithBuyerConsentUpdateRequestBuyerSchema>;

export const ConsentSchema = z.object({
    "analytics": z.boolean().optional(),
    "marketing": z.boolean().optional(),
    "preferences": z.boolean().optional(),
    "sale_of_data": z.boolean().optional(),
});
export type Consent = z.infer<typeof ConsentSchema>;

export const CheckoutWithBuyerConsentResponseBuyerSchema = z.object({
    "email": z.string().optional(),
    "first_name": z.string().optional(),
    "full_name": z.string().optional(),
    "last_name": z.string().optional(),
    "phone_number": z.string().optional(),
    "consent": ConsentSchema.optional(),
});
export type CheckoutWithBuyerConsentResponseBuyer = z.infer<typeof CheckoutWithBuyerConsentResponseBuyerSchema>;

export const AllocationElementSchema = z.object({
    "amount": z.number(),
    "path": z.string(),
});
export type AllocationElement = z.infer<typeof AllocationElementSchema>;

export const AllocationClassSchema = z.object({
    "amount": z.number(),
    "path": z.string(),
});
export type AllocationClass = z.infer<typeof AllocationClassSchema>;

export const AllocationSchema = z.object({
    "amount": z.number(),
    "path": z.string(),
});
export type Allocation = z.infer<typeof AllocationSchema>;

export const AdjustmentLineItemSchema = z.object({
    "id": z.string(),
    "quantity": z.number(),
});
export type AdjustmentLineItem = z.infer<typeof AdjustmentLineItemSchema>;

export const EventLineItemSchema = z.object({
    "id": z.string(),
    "quantity": z.number(),
});
export type EventLineItem = z.infer<typeof EventLineItemSchema>;

export const ExpectationLineItemSchema = z.object({
    "id": z.string(),
    "quantity": z.number(),
});
export type ExpectationLineItem = z.infer<typeof ExpectationLineItemSchema>;

export const LineItemQuantitySchema = z.object({
    "fulfilled": z.number(),
    "total": z.number(),
});
export type LineItemQuantity = z.infer<typeof LineItemQuantitySchema>;

export const PlatformOrderConfigSchema = z.object({
    "webhook_url": z.string(),
});
export type PlatformOrderConfig = z.infer<typeof PlatformOrderConfigSchema>;

export const PaymentAccountInfoSchema = z.object({
    "payment_account_reference": z.string().optional(),
});
export type PaymentAccountInfo = z.infer<typeof PaymentAccountInfoSchema>;

export const AdjustmentLineItemClassSchema = z.object({
    "id": z.string(),
    "quantity": z.number(),
});
export type AdjustmentLineItemClass = z.infer<typeof AdjustmentLineItemClassSchema>;

export const IdentityClassSchema = z.object({
    "access_token": z.string(),
});
export type IdentityClass = z.infer<typeof IdentityClassSchema>;

export const BuyerSchema = z.object({
    "email": z.string().optional(),
    "first_name": z.string().optional(),
    "full_name": z.string().optional(),
    "last_name": z.string().optional(),
    "phone_number": z.string().optional(),
});
export type Buyer = z.infer<typeof BuyerSchema>;

export const CardCredentialSchema = z.object({
    "card_number_type": CardNumberTypeSchema,
    "cryptogram": z.string().optional(),
    "cvc": z.string().optional(),
    "eci_value": z.string().optional(),
    "expiry_month": z.number().optional(),
    "expiry_year": z.number().optional(),
    "name": z.string().optional(),
    "number": z.string().optional(),
    "type": CardPaymentInstrumentTypeSchema,
});
export type CardCredential = z.infer<typeof CardCredentialSchema>;

export const CardPaymentInstrumentSchema = z.object({
    "billing_address": BillingAddressClassSchema.optional(),
    "credential": PaymentCredentialSchema.optional(),
    "handler_id": z.string(),
    "id": z.string(),
    "type": CardPaymentInstrumentTypeSchema,
    "brand": z.string(),
    "expiry_month": z.number().optional(),
    "expiry_year": z.number().optional(),
    "last_digits": z.string(),
    "rich_card_art": z.string().optional(),
    "rich_text_description": z.string().optional(),
});
export type CardPaymentInstrument = z.infer<typeof CardPaymentInstrumentSchema>;

export const PurpleContextSchema = z.object({
    "country": z.string().optional(),
    "postal_code": z.string().optional(),
    "region": z.string().optional(),
});
export type PurpleContext = z.infer<typeof PurpleContextSchema>;

export const ExpectationLineItemClassSchema = z.object({
    "id": z.string(),
    "quantity": z.number(),
});
export type ExpectationLineItemClass = z.infer<typeof ExpectationLineItemClassSchema>;

export const FulfillmentDestinationRequestSchema = z.object({
    "address_country": z.string().optional(),
    "address_locality": z.string().optional(),
    "address_region": z.string().optional(),
    "extended_address": z.string().optional(),
    "first_name": z.string().optional(),
    "full_name": z.string().optional(),
    "last_name": z.string().optional(),
    "phone_number": z.string().optional(),
    "postal_code": z.string().optional(),
    "street_address": z.string().optional(),
    "id": z.string().optional(),
    "address": BillingAddressClassSchema.optional(),
    "name": z.string().optional(),
});
export type FulfillmentDestinationRequest = z.infer<typeof FulfillmentDestinationRequestSchema>;

export const FulfillmentEventLineItemSchema = z.object({
    "id": z.string(),
    "quantity": z.number(),
});
export type FulfillmentEventLineItem = z.infer<typeof FulfillmentEventLineItemSchema>;

export const FulfillmentGroupCreateRequestSchema = z.object({
    "selected_option_id": z.union([z.null(), z.string()]).optional(),
});
export type FulfillmentGroupCreateRequest = z.infer<typeof FulfillmentGroupCreateRequestSchema>;

export const FulfillmentGroupUpdateRequestSchema = z.object({
    "id": z.string(),
    "selected_option_id": z.union([z.null(), z.string()]).optional(),
});
export type FulfillmentGroupUpdateRequest = z.infer<typeof FulfillmentGroupUpdateRequestSchema>;

export const FulfillmentMethodCreateRequestSchema = z.object({
    "destinations": z.array(FulfillmentDestinationRequestElementSchema).optional(),
    "groups": z.array(GroupElementSchema).optional(),
    "line_item_ids": z.array(z.string()).optional(),
    "selected_destination_id": z.union([z.null(), z.string()]).optional(),
    "type": FulfillmentMethodElementSchema,
});
export type FulfillmentMethodCreateRequest = z.infer<typeof FulfillmentMethodCreateRequestSchema>;

export const GroupClassSchema = z.object({
    "id": z.string(),
    "selected_option_id": z.union([z.null(), z.string()]).optional(),
});
export type GroupClass = z.infer<typeof GroupClassSchema>;

export const ItemCreateRequestSchema = z.object({
    "id": z.string(),
});
export type ItemCreateRequest = z.infer<typeof ItemCreateRequestSchema>;

export const ItemUpdateRequestSchema = z.object({
    "id": z.string(),
});
export type ItemUpdateRequest = z.infer<typeof ItemUpdateRequestSchema>;

export const LineItemCreateRequestSchema = z.object({
    "item": ItemClassSchema,
    "quantity": z.number(),
});
export type LineItemCreateRequest = z.infer<typeof LineItemCreateRequestSchema>;

export const LineItemUpdateRequestSchema = z.object({
    "id": z.string().optional(),
    "item": LineItemWithMenuModifiersUpdateRequestItemSchema,
    "parent_id": z.string().optional(),
    "quantity": z.number(),
});
export type LineItemUpdateRequest = z.infer<typeof LineItemUpdateRequestSchema>;

export const LinkSchema = z.object({
    "title": z.string().optional(),
    "type": z.string(),
    "url": z.string(),
});
export type Link = z.infer<typeof LinkSchema>;

export const MessageErrorSchema = z.object({
    "code": z.string(),
    "content": z.string(),
    "content_type": ContentTypeSchema.optional(),
    "path": z.string().optional(),
    "severity": SeveritySchema,
    "type": MessageErrorTypeSchema,
});
export type MessageError = z.infer<typeof MessageErrorSchema>;

export const MessageInfoSchema = z.object({
    "code": z.string().optional(),
    "content": z.string(),
    "content_type": ContentTypeSchema.optional(),
    "path": z.string().optional(),
    "type": MessageInfoTypeSchema,
});
export type MessageInfo = z.infer<typeof MessageInfoSchema>;

export const MessageWarningSchema = z.object({
    "code": z.string(),
    "content": z.string(),
    "content_type": ContentTypeSchema.optional(),
    "path": z.string().optional(),
    "type": MessageWarningTypeSchema,
});
export type MessageWarning = z.infer<typeof MessageWarningSchema>;

export const OptionValueSchema = z.object({
    "label": z.string(),
});
export type OptionValue = z.infer<typeof OptionValueSchema>;

export const OrderConfirmationSchema = z.object({
    "id": z.string(),
    "permalink_url": z.string(),
});
export type OrderConfirmation = z.infer<typeof OrderConfirmationSchema>;

export const OrderLineItemQuantitySchema = z.object({
    "fulfilled": z.number(),
    "total": z.number(),
});
export type OrderLineItemQuantity = z.infer<typeof OrderLineItemQuantitySchema>;

export const PaymentIdentitySchema = z.object({
    "access_token": z.string(),
});
export type PaymentIdentity = z.infer<typeof PaymentIdentitySchema>;

export const PaymentInstrumentBaseSchema = z.object({
    "billing_address": BillingAddressClassSchema.optional(),
    "credential": PaymentCredentialSchema.optional(),
    "handler_id": z.string(),
    "id": z.string(),
    "type": z.string(),
});
export type PaymentInstrumentBase = z.infer<typeof PaymentInstrumentBaseSchema>;

export const PlatformFulfillmentConfigSchema = z.object({
    "supports_multi_group": z.boolean().optional(),
});
export type PlatformFulfillmentConfig = z.infer<typeof PlatformFulfillmentConfigSchema>;

export const PriceFilterSchema = z.object({
    "max": z.number().optional(),
    "min": z.number().optional(),
});
export type PriceFilter = z.infer<typeof PriceFilterSchema>;

export const PriceRangeSchema = z.object({
    "max": MaxClassSchema,
    "min": MaxClassSchema,
});
export type PriceRange = z.infer<typeof PriceRangeSchema>;

export const ProductOptionSchema = z.object({
    "name": z.string(),
    "values": z.array(ValueElementSchema),
});
export type ProductOption = z.infer<typeof ProductOptionSchema>;

export const RatingSchema = z.object({
    "count": z.number().optional(),
    "scale_max": z.number(),
    "value": z.number(),
});
export type Rating = z.infer<typeof RatingSchema>;

export const RetailLocationRequestSchema = z.object({
    "address": BillingAddressClassSchema.optional(),
    "name": z.string(),
});
export type RetailLocationRequest = z.infer<typeof RetailLocationRequestSchema>;

export const SelectedOptionSchema = z.object({
    "label": z.string(),
    "name": z.string(),
});
export type SelectedOption = z.infer<typeof SelectedOptionSchema>;

export const ShippingDestinationRequestSchema = z.object({
    "address_country": z.string().optional(),
    "address_locality": z.string().optional(),
    "address_region": z.string().optional(),
    "extended_address": z.string().optional(),
    "first_name": z.string().optional(),
    "full_name": z.string().optional(),
    "last_name": z.string().optional(),
    "phone_number": z.string().optional(),
    "postal_code": z.string().optional(),
    "street_address": z.string().optional(),
    "id": z.string().optional(),
});
export type ShippingDestinationRequest = z.infer<typeof ShippingDestinationRequestSchema>;

export const ShippingDestinationResponseSchema = z.object({
    "address_country": z.string().optional(),
    "address_locality": z.string().optional(),
    "address_region": z.string().optional(),
    "extended_address": z.string().optional(),
    "first_name": z.string().optional(),
    "full_name": z.string().optional(),
    "last_name": z.string().optional(),
    "phone_number": z.string().optional(),
    "postal_code": z.string().optional(),
    "street_address": z.string().optional(),
    "id": z.string(),
});
export type ShippingDestinationResponse = z.infer<typeof ShippingDestinationResponseSchema>;

export const TokenCredentialCreateRequestSchema = z.object({
    "token": z.string(),
    "type": z.string(),
});
export type TokenCredentialCreateRequest = z.infer<typeof TokenCredentialCreateRequestSchema>;

export const TokenCredentialUpdateRequestSchema = z.object({
    "token": z.string(),
    "type": z.string(),
});
export type TokenCredentialUpdateRequest = z.infer<typeof TokenCredentialUpdateRequestSchema>;

export const TokenCredentialResponseSchema = z.object({
    "type": z.string(),
});
export type TokenCredentialResponse = z.infer<typeof TokenCredentialResponseSchema>;

export const VariantAvailabilityClassSchema = z.object({
    "available": z.boolean().optional(),
});
export type VariantAvailabilityClass = z.infer<typeof VariantAvailabilityClassSchema>;

export const VariantDescriptionClassSchema = z.object({
    "html": z.string().optional(),
    "markdown": z.string().optional(),
    "plain": z.string().optional(),
});
export type VariantDescriptionClass = z.infer<typeof VariantDescriptionClassSchema>;

export const VariantSellerClassSchema = z.object({
    "links": z.array(LinkElementSchema).optional(),
    "name": z.string().optional(),
});
export type VariantSellerClass = z.infer<typeof VariantSellerClassSchema>;

export const PaymentSchema = z.object({
    "handlers": z.array(PaymentHandlerResponseSchema).optional(),
});
export type Payment = z.infer<typeof PaymentSchema>;

export const UcpServiceSchema = z.object({
    "a2a": A2ASchema.optional(),
    "embedded": EmbeddedSchema.optional(),
    "mcp": McpSchema.optional(),
    "rest": RestSchema.optional(),
    "spec": z.string(),
    "version": z.string(),
});
export type UcpService = z.infer<typeof UcpServiceSchema>;

export const PaymentInstrumentSchema = z.object({
    "billing_address": BillingAddressClassSchema.optional(),
    "credential": PaymentCredentialSchema.optional(),
    "handler_id": z.string(),
    "id": z.string(),
    "type": CardPaymentInstrumentTypeSchema,
    "brand": z.string(),
    "expiry_month": z.number().optional(),
    "expiry_year": z.number().optional(),
    "last_digits": z.string(),
    "rich_card_art": z.string().optional(),
    "rich_text_description": z.string().optional(),
});
export type PaymentInstrument = z.infer<typeof PaymentInstrumentSchema>;

export const CheckoutWithMenuModifiersUpdateRequestPaymentSchema = z.object({
    "instruments": z.array(PaymentInstrumentSchema).optional(),
    "selected_instrument_id": z.string().optional(),
});
export type CheckoutWithMenuModifiersUpdateRequestPayment = z.infer<typeof CheckoutWithMenuModifiersUpdateRequestPaymentSchema>;

export const PaymentResponseSchema = z.object({
    "handlers": z.array(PaymentHandlerResponseSchema),
    "instruments": z.array(PaymentInstrumentSchema).optional(),
    "selected_instrument_id": z.string().optional(),
});
export type PaymentResponse = z.infer<typeof PaymentResponseSchema>;

export const UcpClassSchema = z.object({
    "capabilities": z.array(CapabilityResponseElementSchema),
    "version": z.string(),
});
export type UcpClass = z.infer<typeof UcpClassSchema>;

export const MenuAdditionalChargeSchema = z.object({
    "charge_type": z.string().optional(),
    "flat_charge": FlatChargeSchema.optional(),
    "percentage_charge": PercentageChargeSchema.optional(),
});
export type MenuAdditionalCharge = z.infer<typeof MenuAdditionalChargeSchema>;

export const HoursSchema = z.object({
    "intervals": z.array(MenuHoursIntervalSchema).optional(),
});
export type Hours = z.infer<typeof HoursSchema>;

export const UcpOrderResponseSchema = z.object({
    "capabilities": z.array(CapabilityResponseSchema),
    "version": z.string(),
});
export type UcpOrderResponse = z.infer<typeof UcpOrderResponseSchema>;

export const ListPriceClassSchema = z.object({
    "max": MaxClassSchema,
    "min": MaxClassSchema,
});
export type ListPriceClass = z.infer<typeof ListPriceClassSchema>;

export const OptionElementSchema = z.object({
    "name": z.string(),
    "values": z.array(ValueElementSchema),
});
export type OptionElement = z.infer<typeof OptionElementSchema>;

export const VariantElementSchema = z.object({
    "availability": VariantAvailabilitySchema.optional(),
    "barcode": z.string().optional(),
    "category": z.string().optional(),
    "description": VariantDescriptionSchema,
    "handle": z.string().optional(),
    "id": z.string(),
    "list_price": MaxClassSchema.optional(),
    "media": z.array(MediaElementSchema).optional(),
    "metadata": z.record(z.string(), z.any()).optional(),
    "price": MaxClassSchema,
    "rating": RatingClassSchema.optional(),
    "selected_options": z.array(SelectedOptionElementSchema).optional(),
    "seller": VariantSellerSchema.optional(),
    "sku": z.string().optional(),
    "tags": z.array(z.string()).optional(),
    "title": z.string(),
    "url": z.string().optional(),
});
export type VariantElement = z.infer<typeof VariantElementSchema>;

export const MenuModifierItemSchema = z.object({
    "id": z.string(),
    "metadata": z.record(z.string(), z.any()).optional(),
    "price": PriceSchema,
    "title": z.string(),
});
export type MenuModifierItem = z.infer<typeof MenuModifierItemSchema>;

export const SearchFiltersSchema = z.object({
    "category": z.string().optional(),
    "price": PriceClassSchema.optional(),
});
export type SearchFilters = z.infer<typeof SearchFiltersSchema>;

export const MerchantFulfillmentConfigSchema = z.object({
    "allows_method_combinations": z.array(z.array(FulfillmentMethodElementSchema)).optional(),
    "allows_multi_destination": AllowsMultiDestinationSchema.optional(),
});
export type MerchantFulfillmentConfig = z.infer<typeof MerchantFulfillmentConfigSchema>;

export const MenuMerchantSearchFiltersLocationSchema = z.object({
    "address": PostalAddressSchema.optional(),
    "radius": RadiusClassSchema.optional(),
});
export type MenuMerchantSearchFiltersLocation = z.infer<typeof MenuMerchantSearchFiltersLocationSchema>;

export const DeliveryLocationClassSchema = z.object({
    "address_country": z.string().optional(),
    "address_locality": z.string().optional(),
    "address_region": z.string().optional(),
    "extended_address": z.string().optional(),
    "first_name": z.string().optional(),
    "full_name": z.string().optional(),
    "last_name": z.string().optional(),
    "phone_number": z.string().optional(),
    "postal_code": z.string().optional(),
    "street_address": z.string().optional(),
    "location": CourierLocationSchema.optional(),
});
export type DeliveryLocationClass = z.infer<typeof DeliveryLocationClassSchema>;

export const PurpleDeliverySchema = z.object({
    "courier": CourierClassSchema.optional(),
    "created_at": z.coerce.date(),
    "dropoff": DeliveryLocationClassSchema.optional(),
    "dropoff_eta": z.coerce.date().optional(),
    "id": z.string(),
    "pickup": DeliveryLocationClassSchema.optional(),
    "pickup_eta": z.coerce.date().optional(),
    "price": PriceSchema.optional(),
    "quote_id": z.string(),
    "status": DeliveryStatusSchema,
    "tracking": TrackingClassSchema.optional(),
    "updated_at": z.coerce.date().optional(),
});
export type PurpleDelivery = z.infer<typeof PurpleDeliverySchema>;

export const PurpleDeliveryRequestSchema = z.object({
    "dropoff": DeliveryLocationClassSchema,
    "dropoff_deadline_dt": z.coerce.date().optional(),
    "dropoff_ready_dt": z.coerce.date().optional(),
    "external_id": z.string().optional(),
    "external_store_id": z.string().optional(),
    "manifest_total_value": PriceSchema,
    "pickup": DeliveryLocationClassSchema,
    "pickup_deadline_dt": z.coerce.date().optional(),
    "pickup_ready_dt": z.coerce.date().optional(),
});
export type PurpleDeliveryRequest = z.infer<typeof PurpleDeliveryRequestSchema>;

export const MethodElementSchema = z.object({
    "destinations": z.array(FulfillmentDestinationRequestElementSchema).optional(),
    "groups": z.array(GroupElementSchema).optional(),
    "line_item_ids": z.array(z.string()).optional(),
    "selected_destination_id": z.union([z.null(), z.string()]).optional(),
    "type": FulfillmentMethodElementSchema,
});
export type MethodElement = z.infer<typeof MethodElementSchema>;

export const CheckoutWithDeliveryQuoteIdentifierUpdateRequestFulfillmentSchema = z.object({
    "methods": z.array(MethodElementSchema).optional(),
    "quote_id": z.string().optional(),
    "delivery_request": PurpleDeliveryRequestSchema.optional(),
});
export type CheckoutWithDeliveryQuoteIdentifierUpdateRequestFulfillment = z.infer<typeof CheckoutWithDeliveryQuoteIdentifierUpdateRequestFulfillmentSchema>;

export const FulfillmentGroupResponseSchema = z.object({
    "id": z.string(),
    "line_item_ids": z.array(z.string()),
    "options": z.array(FulfillmentOptionResponseSchema).optional(),
    "selected_option_id": z.union([z.null(), z.string()]).optional(),
});
export type FulfillmentGroupResponse = z.infer<typeof FulfillmentGroupResponseSchema>;

export const ResponseQuoteSchema = z.object({
    "delivery_quote": PurpleDeliveryQuoteSchema,
    "ucp": UcpOrderResponseSchema,
});
export type ResponseQuote = z.infer<typeof ResponseQuoteSchema>;

export const CheckoutWithAp2MandateSchema = z.object({
    "buyer": BuyerClassSchema.optional(),
    "continue_url": z.string().optional(),
    "currency": z.string(),
    "expires_at": z.coerce.date().optional(),
    "id": z.string(),
    "line_items": z.array(LineItemResponseSchema),
    "links": z.array(LinkElementSchema),
    "messages": z.array(MessageElementSchema).optional(),
    "order": OrderClassSchema.optional(),
    "payment": PaymentResponseSchema,
    "status": CheckoutWithMenuModifiersResponseStatusSchema,
    "totals": z.array(TotalResponseSchema),
    "ucp": UcpClassSchema,
    "ap2": Ap2CheckoutResponseObjectSchema.optional(),
});
export type CheckoutWithAp2Mandate = z.infer<typeof CheckoutWithAp2MandateSchema>;

export const CompleteCheckoutRequestWithAp2Schema = z.object({
    "ap2": Ap2CompleteRequestObjectSchema.optional(),
});
export type CompleteCheckoutRequestWithAp2 = z.infer<typeof CompleteCheckoutRequestWithAp2Schema>;

export const BuyerWithConsentCreateRequestSchema = z.object({
    "email": z.string().optional(),
    "first_name": z.string().optional(),
    "full_name": z.string().optional(),
    "last_name": z.string().optional(),
    "phone_number": z.string().optional(),
    "consent": BuyerWithConsentCreateRequestConsentSchema.optional(),
});
export type BuyerWithConsentCreateRequest = z.infer<typeof BuyerWithConsentCreateRequestSchema>;

export const BuyerWithConsentUpdateRequestSchema = z.object({
    "email": z.string().optional(),
    "first_name": z.string().optional(),
    "full_name": z.string().optional(),
    "last_name": z.string().optional(),
    "phone_number": z.string().optional(),
    "consent": BuyerWithConsentUpdateRequestConsentSchema.optional(),
});
export type BuyerWithConsentUpdateRequest = z.infer<typeof BuyerWithConsentUpdateRequestSchema>;

export const CheckoutWithBuyerConsentUpdateRequestSchema = z.object({
    "buyer": CheckoutWithBuyerConsentUpdateRequestBuyerSchema.optional(),
    "currency": z.string(),
    "id": z.string(),
    "line_items": z.array(LineItemClassSchema),
    "payment": CheckoutWithMenuModifiersUpdateRequestPaymentSchema,
});
export type CheckoutWithBuyerConsentUpdateRequest = z.infer<typeof CheckoutWithBuyerConsentUpdateRequestSchema>;

export const BuyerWithConsentResponseSchema = z.object({
    "email": z.string().optional(),
    "first_name": z.string().optional(),
    "full_name": z.string().optional(),
    "last_name": z.string().optional(),
    "phone_number": z.string().optional(),
    "consent": ConsentSchema.optional(),
});
export type BuyerWithConsentResponse = z.infer<typeof BuyerWithConsentResponseSchema>;

export const CheckoutWithBuyerConsentResponseSchema = z.object({
    "buyer": CheckoutWithBuyerConsentResponseBuyerSchema.optional(),
    "continue_url": z.string().optional(),
    "currency": z.string(),
    "expires_at": z.coerce.date().optional(),
    "id": z.string(),
    "line_items": z.array(LineItemResponseSchema),
    "links": z.array(LinkElementSchema),
    "messages": z.array(MessageElementSchema).optional(),
    "order": OrderClassSchema.optional(),
    "payment": PaymentResponseSchema,
    "status": CheckoutWithMenuModifiersResponseStatusSchema,
    "totals": z.array(TotalResponseSchema),
    "ucp": UcpClassSchema,
});
export type CheckoutWithBuyerConsentResponse = z.infer<typeof CheckoutWithBuyerConsentResponseSchema>;

export const CheckoutUpdateRequestSchema = z.object({
    "buyer": BuyerClassSchema.optional(),
    "currency": z.string(),
    "id": z.string(),
    "line_items": z.array(LineItemClassSchema),
    "payment": CheckoutWithMenuModifiersUpdateRequestPaymentSchema,
});
export type CheckoutUpdateRequest = z.infer<typeof CheckoutUpdateRequestSchema>;

export const CheckoutResponseSchema = z.object({
    "buyer": BuyerClassSchema.optional(),
    "continue_url": z.string().optional(),
    "currency": z.string(),
    "expires_at": z.coerce.date().optional(),
    "id": z.string(),
    "line_items": z.array(LineItemResponseSchema),
    "links": z.array(LinkElementSchema),
    "messages": z.array(MessageElementSchema).optional(),
    "order": OrderClassSchema.optional(),
    "payment": PaymentResponseSchema,
    "status": CheckoutWithMenuModifiersResponseStatusSchema,
    "totals": z.array(TotalResponseSchema),
    "ucp": UcpClassSchema,
});
export type CheckoutResponse = z.infer<typeof CheckoutResponseSchema>;

export const AppliedElementSchema = z.object({
    "allocations": z.array(AllocationElementSchema).optional(),
    "amount": z.number(),
    "automatic": z.boolean().optional(),
    "code": z.string().optional(),
    "method": MethodSchema.optional(),
    "priority": z.number().optional(),
    "title": z.string(),
});
export type AppliedElement = z.infer<typeof AppliedElementSchema>;

export const AppliedClassSchema = z.object({
    "allocations": z.array(AllocationClassSchema).optional(),
    "amount": z.number(),
    "automatic": z.boolean().optional(),
    "code": z.string().optional(),
    "method": MethodSchema.optional(),
    "priority": z.number().optional(),
    "title": z.string(),
});
export type AppliedClass = z.infer<typeof AppliedClassSchema>;

export const AppliedDiscountSchema = z.object({
    "allocations": z.array(AllocationSchema).optional(),
    "amount": z.number(),
    "automatic": z.boolean().optional(),
    "code": z.string().optional(),
    "method": MethodSchema.optional(),
    "priority": z.number().optional(),
    "title": z.string(),
});
export type AppliedDiscount = z.infer<typeof AppliedDiscountSchema>;

export const FulfillmentRequestSchema = z.object({
    "methods": z.array(MethodElementSchema).optional(),
});
export type FulfillmentRequest = z.infer<typeof FulfillmentRequestSchema>;

export const CheckoutWithFulfillmentUpdateRequestSchema = z.object({
    "buyer": BuyerClassSchema.optional(),
    "currency": z.string(),
    "id": z.string(),
    "line_items": z.array(LineItemClassSchema),
    "payment": CheckoutWithMenuModifiersUpdateRequestPaymentSchema,
    "fulfillment": FulfillmentRequestSchema.optional(),
});
export type CheckoutWithFulfillmentUpdateRequest = z.infer<typeof CheckoutWithFulfillmentUpdateRequestSchema>;

export const AdjustmentElementSchema = z.object({
    "amount": z.number().optional(),
    "description": z.string().optional(),
    "id": z.string(),
    "line_items": z.array(AdjustmentLineItemSchema).optional(),
    "occurred_at": z.coerce.date(),
    "status": AdjustmentStatusSchema,
    "type": z.string(),
});
export type AdjustmentElement = z.infer<typeof AdjustmentElementSchema>;

export const EventElementSchema = z.object({
    "carrier": z.string().optional(),
    "description": z.string().optional(),
    "id": z.string(),
    "line_items": z.array(EventLineItemSchema),
    "occurred_at": z.coerce.date(),
    "tracking_number": z.string().optional(),
    "tracking_url": z.string().optional(),
    "type": z.string(),
});
export type EventElement = z.infer<typeof EventElementSchema>;

export const ExpectationElementSchema = z.object({
    "description": z.string().optional(),
    "destination": BillingAddressClassSchema,
    "fulfillable_on": z.string().optional(),
    "id": z.string(),
    "line_items": z.array(ExpectationLineItemSchema),
    "method_type": MethodTypeSchema,
});
export type ExpectationElement = z.infer<typeof ExpectationElementSchema>;

export const OrderLineItemClassSchema = z.object({
    "id": z.string(),
    "item": ItemResponseSchema,
    "parent_id": z.string().optional(),
    "quantity": LineItemQuantitySchema,
    "status": LineItemStatusSchema,
    "totals": z.array(TotalResponseSchema),
});
export type OrderLineItemClass = z.infer<typeof OrderLineItemClassSchema>;

export const PaymentCreateRequestSchema = z.object({
    "instruments": z.array(PaymentInstrumentSchema).optional(),
    "selected_instrument_id": z.string().optional(),
});
export type PaymentCreateRequest = z.infer<typeof PaymentCreateRequestSchema>;

export const PaymentUpdateRequestSchema = z.object({
    "instruments": z.array(PaymentInstrumentSchema).optional(),
    "selected_instrument_id": z.string().optional(),
});
export type PaymentUpdateRequest = z.infer<typeof PaymentUpdateRequestSchema>;

export const PaymentDataSchema = z.object({
    "payment_data": PaymentInstrumentSchema,
});
export type PaymentData = z.infer<typeof PaymentDataSchema>;

export const AdjustmentSchema = z.object({
    "amount": z.number().optional(),
    "description": z.string().optional(),
    "id": z.string(),
    "line_items": z.array(AdjustmentLineItemClassSchema).optional(),
    "occurred_at": z.coerce.date(),
    "status": AdjustmentStatusSchema,
    "type": z.string(),
});
export type Adjustment = z.infer<typeof AdjustmentSchema>;

export const BindingSchema = z.object({
    "checkout_id": z.string(),
    "identity": IdentityClassSchema.optional(),
});
export type Binding = z.infer<typeof BindingSchema>;

export const ExpectationSchema = z.object({
    "description": z.string().optional(),
    "destination": BillingAddressClassSchema,
    "fulfillable_on": z.string().optional(),
    "id": z.string(),
    "line_items": z.array(ExpectationLineItemClassSchema),
    "method_type": MethodTypeSchema,
});
export type Expectation = z.infer<typeof ExpectationSchema>;

export const FulfillmentEventSchema = z.object({
    "carrier": z.string().optional(),
    "description": z.string().optional(),
    "id": z.string(),
    "line_items": z.array(FulfillmentEventLineItemSchema),
    "occurred_at": z.coerce.date(),
    "tracking_number": z.string().optional(),
    "tracking_url": z.string().optional(),
    "type": z.string(),
});
export type FulfillmentEvent = z.infer<typeof FulfillmentEventSchema>;

export const FulfillmentMethodUpdateRequestSchema = z.object({
    "destinations": z.array(FulfillmentDestinationRequestElementSchema).optional(),
    "groups": z.array(GroupClassSchema).optional(),
    "id": z.string(),
    "line_item_ids": z.array(z.string()),
    "selected_destination_id": z.union([z.null(), z.string()]).optional(),
});
export type FulfillmentMethodUpdateRequest = z.infer<typeof FulfillmentMethodUpdateRequestSchema>;

export const OrderLineItemSchema = z.object({
    "id": z.string(),
    "item": ItemResponseSchema,
    "parent_id": z.string().optional(),
    "quantity": OrderLineItemQuantitySchema,
    "status": LineItemStatusSchema,
    "totals": z.array(TotalResponseSchema),
});
export type OrderLineItem = z.infer<typeof OrderLineItemSchema>;

export const VariantSchema = z.object({
    "availability": VariantAvailabilityClassSchema.optional(),
    "barcode": z.string().optional(),
    "category": z.string().optional(),
    "description": VariantDescriptionClassSchema,
    "handle": z.string().optional(),
    "id": z.string(),
    "list_price": MaxClassSchema.optional(),
    "media": z.array(MediaElementSchema).optional(),
    "metadata": z.record(z.string(), z.any()).optional(),
    "price": MaxClassSchema,
    "rating": RatingClassSchema.optional(),
    "selected_options": z.array(SelectedOptionElementSchema).optional(),
    "seller": VariantSellerClassSchema.optional(),
    "sku": z.string().optional(),
    "tags": z.array(z.string()).optional(),
    "title": z.string(),
    "url": z.string().optional(),
});
export type Variant = z.infer<typeof VariantSchema>;

export const UcpDiscoveryMetadataSchema = z.object({
    "capabilities": z.array(CapabilityDiscoverySchema),
    "services": z.record(z.string(), UcpServiceSchema),
    "version": z.string(),
});
export type UcpDiscoveryMetadata = z.infer<typeof UcpDiscoveryMetadataSchema>;

export const PaymentClassSchema = z.object({
    "instruments": z.array(PaymentInstrumentSchema).optional(),
    "selected_instrument_id": z.string().optional(),
});
export type PaymentClass = z.infer<typeof PaymentClassSchema>;

export const MenuSchema = z.object({
    "additional_charges": z.array(MenuAdditionalChargeSchema).optional(),
    "category_ids": z.array(z.string()),
    "description": z.string().optional(),
    "fulfillment_modes": z.array(z.string()).optional(),
    "hours": HoursSchema.optional(),
    "id": z.string(),
    "name": z.string(),
});
export type Menu = z.infer<typeof MenuSchema>;

export const ProductSchema = z.object({
    "category": z.string().optional(),
    "description": ProductDescriptionSchema,
    "handle": z.string().optional(),
    "id": z.string(),
    "list_price": ListPriceClassSchema.optional(),
    "media": z.array(MediaElementSchema).optional(),
    "metadata": z.record(z.string(), z.any()).optional(),
    "options": z.array(OptionElementSchema).optional(),
    "price": ListPriceClassSchema,
    "rating": RatingClassSchema.optional(),
    "tags": z.array(z.string()).optional(),
    "title": z.string(),
    "url": z.string().optional(),
    "variants": z.array(VariantElementSchema),
});
export type Product = z.infer<typeof ProductSchema>;

export const GetModifierItemResponseSchema = z.object({
    "messages": z.array(MessageSchema).optional(),
    "modifier_item": MenuModifierItemSchema,
    "ucp": UcpOrderResponseSchema,
});
export type GetModifierItemResponse = z.infer<typeof GetModifierItemResponseSchema>;

export const SearchRequestSchema = z.object({
    "context": ContextSchema.optional(),
    "filters": SearchFiltersSchema.optional(),
    "pagination": RequestSchema.optional(),
    "query": z.string(),
});
export type SearchRequest = z.infer<typeof SearchRequestSchema>;

export const SearchResponseSchema = z.object({
    "messages": z.array(MessageSchema).optional(),
    "pagination": ResponseSchema.optional(),
    "products": z.array(ProductSchema),
    "ucp": UcpOrderResponseSchema,
});
export type SearchResponse = z.infer<typeof SearchResponseSchema>;

export const MerchantSchema = z.object({
    "category": z.string().optional(),
    "description": MerchantDescriptionSchema.optional(),
    "fulfillment_config": MerchantFulfillmentConfigSchema.optional(),
    "id": z.string(),
    "locations": z.array(RetailLocationResponseSchema).optional(),
    "media": z.array(MediaSchema).optional(),
    "metadata": z.record(z.string(), z.any()).optional(),
    "name": z.string(),
    "tags": z.array(z.string()).optional(),
    "url": z.string().optional(),
});
export type Merchant = z.infer<typeof MerchantSchema>;

export const MenuMerchantSearchFiltersSchema = z.object({
    "category": z.string().optional(),
    "fulfillment_method": FulfillmentMethodElementSchema.optional(),
    "location": MenuMerchantSearchFiltersLocationSchema.optional(),
    "open_now": z.boolean().optional(),
});
export type MenuMerchantSearchFilters = z.infer<typeof MenuMerchantSearchFiltersSchema>;

export const RequestDeliverySchema = z.object({
    "external_id": z.string().optional(),
    "quote_id": z.string().optional(),
    "dropoff": DeliveryLocationClassSchema.optional(),
    "dropoff_deadline_dt": z.coerce.date().optional(),
    "dropoff_ready_dt": z.coerce.date().optional(),
    "external_store_id": z.string().optional(),
    "manifest_total_value": PriceSchema.optional(),
    "pickup": DeliveryLocationClassSchema.optional(),
    "pickup_deadline_dt": z.coerce.date().optional(),
    "pickup_ready_dt": z.coerce.date().optional(),
});
export type RequestDelivery = z.infer<typeof RequestDeliverySchema>;

export const ResponseDeliverySchema = z.object({
    "delivery": PurpleDeliverySchema,
    "ucp": UcpOrderResponseSchema,
});
export type ResponseDelivery = z.infer<typeof ResponseDeliverySchema>;

export const CheckoutWithDeliveryQuoteIdentifierCreateRequestFulfillmentSchema = z.object({
    "methods": z.array(MethodElementSchema).optional(),
    "quote_id": z.string().optional(),
    "delivery_request": PurpleDeliveryRequestSchema.optional(),
});
export type CheckoutWithDeliveryQuoteIdentifierCreateRequestFulfillment = z.infer<typeof CheckoutWithDeliveryQuoteIdentifierCreateRequestFulfillmentSchema>;

export const CheckoutWithDeliveryQuoteIdentifierUpdateRequestSchema = z.object({
    "buyer": BuyerClassSchema.optional(),
    "currency": z.string(),
    "id": z.string(),
    "line_items": z.array(LineItemClassSchema),
    "payment": CheckoutWithMenuModifiersUpdateRequestPaymentSchema,
    "fulfillment": CheckoutWithDeliveryQuoteIdentifierUpdateRequestFulfillmentSchema.optional(),
});
export type CheckoutWithDeliveryQuoteIdentifierUpdateRequest = z.infer<typeof CheckoutWithDeliveryQuoteIdentifierUpdateRequestSchema>;

export const FulfillmentMethodResponseSchema = z.object({
    "destinations": z.array(FulfillmentDestinationResponseSchema).optional(),
    "groups": z.array(FulfillmentGroupResponseSchema).optional(),
    "id": z.string(),
    "line_item_ids": z.array(z.string()),
    "selected_destination_id": z.union([z.null(), z.string()]).optional(),
    "type": FulfillmentMethodElementSchema,
});
export type FulfillmentMethodResponse = z.infer<typeof FulfillmentMethodResponseSchema>;

export const CheckoutWithBuyerConsentCreateRequestSchema = z.object({
    "buyer": CheckoutWithBuyerConsentCreateRequestBuyerSchema.optional(),
    "currency": z.string(),
    "line_items": z.array(LineItemElementSchema),
    "payment": PaymentClassSchema,
});
export type CheckoutWithBuyerConsentCreateRequest = z.infer<typeof CheckoutWithBuyerConsentCreateRequestSchema>;

export const CheckoutCreateRequestSchema = z.object({
    "buyer": BuyerClassSchema.optional(),
    "currency": z.string(),
    "line_items": z.array(LineItemElementSchema),
    "payment": PaymentClassSchema,
});
export type CheckoutCreateRequest = z.infer<typeof CheckoutCreateRequestSchema>;

export const CheckoutWithDiscountCreateRequestDiscountsSchema = z.object({
    "applied": z.array(AppliedElementSchema).optional(),
    "codes": z.array(z.string()).optional(),
});
export type CheckoutWithDiscountCreateRequestDiscounts = z.infer<typeof CheckoutWithDiscountCreateRequestDiscountsSchema>;

export const CheckoutWithDiscountUpdateRequestDiscountsSchema = z.object({
    "applied": z.array(AppliedClassSchema).optional(),
    "codes": z.array(z.string()).optional(),
});
export type CheckoutWithDiscountUpdateRequestDiscounts = z.infer<typeof CheckoutWithDiscountUpdateRequestDiscountsSchema>;

export const DiscountsObjectSchema = z.object({
    "applied": z.array(AppliedDiscountSchema).optional(),
    "codes": z.array(z.string()).optional(),
});
export type DiscountsObject = z.infer<typeof DiscountsObjectSchema>;

export const CheckoutWithFulfillmentCreateRequestSchema = z.object({
    "buyer": BuyerClassSchema.optional(),
    "currency": z.string(),
    "line_items": z.array(LineItemElementSchema),
    "payment": PaymentClassSchema,
    "fulfillment": FulfillmentRequestSchema.optional(),
});
export type CheckoutWithFulfillmentCreateRequest = z.infer<typeof CheckoutWithFulfillmentCreateRequestSchema>;

export const FulfillmentResponseSchema = z.object({
    "available_methods": z.array(FulfillmentAvailableMethodResponseSchema).optional(),
    "methods": z.array(FulfillmentMethodResponseSchema).optional(),
});
export type FulfillmentResponse = z.infer<typeof FulfillmentResponseSchema>;

export const OrderFulfillmentSchema = z.object({
    "events": z.array(EventElementSchema).optional(),
    "expectations": z.array(ExpectationElementSchema).optional(),
});
export type OrderFulfillment = z.infer<typeof OrderFulfillmentSchema>;

export const UcpDiscoveryProfileSchema = z.object({
    "payment": PaymentSchema.optional(),
    "signing_keys": z.array(SigningKeySchema).optional(),
    "ucp": UcpDiscoveryMetadataSchema,
});
export type UcpDiscoveryProfile = z.infer<typeof UcpDiscoveryProfileSchema>;

export const GetItemResponseSchema = z.object({
    "messages": z.array(MessageSchema).optional(),
    "product": ProductSchema.optional(),
    "ucp": UcpOrderResponseSchema,
});
export type GetItemResponse = z.infer<typeof GetItemResponseSchema>;

export const GetMerchantResponseSchema = z.object({
    "merchant": MerchantSchema.optional(),
    "messages": z.array(MessageSchema).optional(),
    "ucp": UcpOrderResponseSchema,
});
export type GetMerchantResponse = z.infer<typeof GetMerchantResponseSchema>;

export const CheckoutWithDeliveryQuoteIdentifierCreateRequestSchema = z.object({
    "buyer": BuyerClassSchema.optional(),
    "currency": z.string(),
    "line_items": z.array(LineItemElementSchema),
    "payment": PaymentClassSchema,
    "fulfillment": CheckoutWithDeliveryQuoteIdentifierCreateRequestFulfillmentSchema.optional(),
});
export type CheckoutWithDeliveryQuoteIdentifierCreateRequest = z.infer<typeof CheckoutWithDeliveryQuoteIdentifierCreateRequestSchema>;

export const FulfillmentClassSchema = z.object({
    "available_methods": z.array(FulfillmentAvailableMethodResponseSchema).optional(),
    "methods": z.array(FulfillmentMethodResponseSchema).optional(),
    "quote_id": z.string().optional(),
    "delivery_request": PurpleDeliveryRequestSchema.optional(),
});
export type FulfillmentClass = z.infer<typeof FulfillmentClassSchema>;

export const CheckoutWithDiscountCreateRequestSchema = z.object({
    "buyer": BuyerClassSchema.optional(),
    "currency": z.string(),
    "line_items": z.array(LineItemElementSchema),
    "payment": PaymentClassSchema,
    "discounts": CheckoutWithDiscountCreateRequestDiscountsSchema.optional(),
});
export type CheckoutWithDiscountCreateRequest = z.infer<typeof CheckoutWithDiscountCreateRequestSchema>;

export const CheckoutWithDiscountUpdateRequestSchema = z.object({
    "buyer": BuyerClassSchema.optional(),
    "currency": z.string(),
    "id": z.string(),
    "line_items": z.array(LineItemClassSchema),
    "payment": CheckoutWithMenuModifiersUpdateRequestPaymentSchema,
    "discounts": CheckoutWithDiscountUpdateRequestDiscountsSchema.optional(),
});
export type CheckoutWithDiscountUpdateRequest = z.infer<typeof CheckoutWithDiscountUpdateRequestSchema>;

export const CheckoutWithDiscountResponseSchema = z.object({
    "buyer": BuyerClassSchema.optional(),
    "continue_url": z.string().optional(),
    "currency": z.string(),
    "expires_at": z.coerce.date().optional(),
    "id": z.string(),
    "line_items": z.array(LineItemResponseSchema),
    "links": z.array(LinkElementSchema),
    "messages": z.array(MessageElementSchema).optional(),
    "order": OrderClassSchema.optional(),
    "payment": PaymentResponseSchema,
    "status": CheckoutWithMenuModifiersResponseStatusSchema,
    "totals": z.array(TotalResponseSchema),
    "ucp": UcpClassSchema,
    "discounts": DiscountsObjectSchema.optional(),
});
export type CheckoutWithDiscountResponse = z.infer<typeof CheckoutWithDiscountResponseSchema>;

export const CheckoutWithFulfillmentResponseSchema = z.object({
    "buyer": BuyerClassSchema.optional(),
    "continue_url": z.string().optional(),
    "currency": z.string(),
    "expires_at": z.coerce.date().optional(),
    "id": z.string(),
    "line_items": z.array(LineItemResponseSchema),
    "links": z.array(LinkElementSchema),
    "messages": z.array(MessageElementSchema).optional(),
    "order": OrderClassSchema.optional(),
    "payment": PaymentResponseSchema,
    "status": CheckoutWithMenuModifiersResponseStatusSchema,
    "totals": z.array(TotalResponseSchema),
    "ucp": UcpClassSchema,
    "fulfillment": FulfillmentResponseSchema.optional(),
});
export type CheckoutWithFulfillmentResponse = z.infer<typeof CheckoutWithFulfillmentResponseSchema>;

export const OrderSchema = z.object({
    "adjustments": z.array(AdjustmentElementSchema).optional(),
    "checkout_id": z.string(),
    "fulfillment": OrderFulfillmentSchema,
    "id": z.string(),
    "line_items": z.array(OrderLineItemClassSchema),
    "permalink_url": z.string(),
    "totals": z.array(TotalResponseSchema),
    "ucp": UcpClassSchema,
});
export type Order = z.infer<typeof OrderSchema>;

export const CheckoutWithDeliveryQuoteIdentifierResponseSchema = z.object({
    "buyer": BuyerClassSchema.optional(),
    "continue_url": z.string().optional(),
    "currency": z.string(),
    "expires_at": z.coerce.date().optional(),
    "id": z.string(),
    "line_items": z.array(LineItemResponseSchema),
    "links": z.array(LinkElementSchema),
    "messages": z.array(MessageElementSchema).optional(),
    "order": OrderClassSchema.optional(),
    "payment": PaymentResponseSchema,
    "status": CheckoutWithMenuModifiersResponseStatusSchema,
    "totals": z.array(TotalResponseSchema),
    "ucp": UcpClassSchema,
    "fulfillment": FulfillmentClassSchema.optional(),
});
export type CheckoutWithDeliveryQuoteIdentifierResponse = z.infer<typeof CheckoutWithDeliveryQuoteIdentifierResponseSchema>;
