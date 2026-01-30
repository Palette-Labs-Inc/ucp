<!--
  Copyright 2026 UCP Authors

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
-->

# Delivery Lifecycle & Payments

This document explains the delivery lifecycle, when payment handlers are
discovered, when tokens are created, and how events are emitted for delivery
updates. It also includes an end-to-end example for platform-to-platform
delivery with required payments.

## Handler Discovery Timing

Delivery aligns with shopping checkout norms:

- **Shopping checkout:** Payment handlers are surfaced in the **create checkout
  response** (`payment.handlers`). This is when the platform learns how to
  acquire a token before calling `complete_checkout`.
- **Delivery:** Payment handlers are surfaced in the **quote response**
  (`payment.handlers`). This is when the platform learns how to acquire a token
  before calling `create_delivery`.

### Optional Pre-Discovery

If the delivery service publishes `payment.handlers` in its discovery profile,
platforms MAY prefetch handler specs **before** requesting a quote. The quote
response remains the **authoritative source** because delivery pricing and
accepted payment methods can be context-sensitive (market, timing, order value).

## Token Creation Timing

Tokens are created during **instrument acquisition**, after handler discovery
and before the `create_delivery` request:

1. Platform reads `payment.handlers` from the delivery quote response.
2. Platform executes the handler protocol (tokenization, encryption, or
   authorization capture).
3. Platform submits `payment_data` in `create_delivery`.

See the [Payment Handler Guide](../payment-handler-guide.md) and
[Tokenization Guide](../tokenization-guide.md) for handler execution and binding
requirements.

## Delivery Lifecycle

Delivery state changes are represented by:

- **Resource status:** `delivery.status`
- **Lifecycle events:** `DeliveryEvent` payloads

### Delivery Status Values

`pending → pickup → pickup_complete → dropoff → delivered`

Other statuses:

- `canceled`
- `returned`
- `ongoing`

### Delivery Event Schema

Delivery events MUST conform to
`spec/source/schemas/delivery/types/delivery_event.json` and include the full
delivery snapshot:

```json
{
  "event_id": "evt_123",
  "event_type": "pickup",
  "created_at": "2026-01-30T18:25:00Z",
  "delivery": {
    "id": "delivery_123",
    "status": "pickup",
    "quote_id": "quote_123"
  }
}
```

Events are delivered via:

- **Webhook:** `delivery_event_webhook` (REST)
- **Embedded:** `ed.delivery.event`, `ed.delivery.change`

## End-to-End Example (Platform-to-Platform + Payment)

Scenario:

- **Platform A** is the delivery service and Merchant of Record for delivery
  fees.
- **Platform B** is the requesting platform.

### 1) Discovery (Platform B → Platform A)

Platform B fetches `/.well-known/ucp` from Platform A to discover the delivery
service endpoint and capabilities.

### 2) Create Quote (Platform B → Platform A)

```json
POST /delivery-quotes

{
  "delivery_request": {
    "pickup": {
      "id": "store_1",
      "title": "Downtown Store",
      "address": {
        "street_address": "123 Main St",
        "address_locality": "Springfield",
        "address_region": "IL",
        "postal_code": "62701",
        "address_country": "US"
      }
    },
    "dropoff": {
      "id": "dropoff_1",
      "recipient_name": "Alex Smith",
      "address": {
        "street_address": "456 Oak Ave",
        "address_locality": "Springfield",
        "address_region": "IL",
        "postal_code": "62701",
        "address_country": "US"
      }
    },
    "pickup_ready_dt": "2026-01-30T18:05:00Z",
    "dropoff_deadline_dt": "2026-01-30T19:00:00Z",
    "items_value": {
      "amount": 4599,
      "currency": "USD"
    }
  }
}
```

### 3) Quote Response (Platform A → Platform B)

```json
{
  "ucp": {
    "version": "2026-01-19",
    "capabilities": [
      { "name": "xyz.localprotocol.delivery", "version": "2026-01-19" }
    ]
  },
  "quote": {
    "quote_id": "quote_123",
    "expires_at": "2026-01-30T18:30:00Z",
    "totals": [
      { "type": "subtotal", "amount": 599 },
      { "type": "tax", "amount": 48 },
      { "type": "total", "amount": 647 }
    ]
  },
  "payment": {
    "handlers": [
      {
        "id": "delivery_tokenizer",
        "name": "com.example.processor_tokenizer",
        "version": "2026-01-11",
        "spec": "https://example.com/ucp/processor-tokenizer.json",
        "config_schema": "https://example.com/ucp/processor-tokenizer/config.json",
        "instrument_schemas": [
          "https://ucp.dev/schemas/shopping/types/card_payment_instrument.json"
        ],
        "config": {
          "endpoint": "https://api.psp.example/v1/tokenize",
          "identity": { "access_token": "delivery_merchant_123" },
          "environment": "production"
        }
      }
    ]
  }
}
```

### 4) Token Acquisition (Platform B ↔ PSP)

Platform B calls the handler’s tokenization endpoint and binds the credential to
`quote_id` (preferred) and the handler `identity`.

### 5) Create Delivery (Platform B → Platform A)

```json
POST /deliveries

{
  "delivery_request": {
    "pickup": {
      "id": "store_1",
      "title": "Downtown Store",
      "address": {
        "street_address": "123 Main St",
        "address_locality": "Springfield",
        "address_region": "IL",
        "postal_code": "62701",
        "address_country": "US"
      }
    },
    "dropoff": {
      "id": "dropoff_1",
      "recipient_name": "Alex Smith",
      "address": {
        "street_address": "456 Oak Ave",
        "address_locality": "Springfield",
        "address_region": "IL",
        "postal_code": "62701",
        "address_country": "US"
      }
    },
    "pickup_ready_dt": "2026-01-30T18:05:00Z",
    "dropoff_deadline_dt": "2026-01-30T19:00:00Z",
    "items_value": {
      "amount": 4599,
      "currency": "USD"
    }
  },
  "payment_data": {
    "id": "instr_1",
    "handler_id": "delivery_tokenizer",
    "type": "card",
    "brand": "visa",
    "last_digits": "4242",
    "credential": {
      "type": "token",
      "token": "tok_delivery_abc123"
    }
  }
}
```

### 6) Delivery Events (Platform A → Platform B)

Webhook example:

```json
{
  "event_id": "evt_456",
  "event_type": "pickup_complete",
  "created_at": "2026-01-30T18:32:00Z",
  "delivery": {
    "id": "delivery_123",
    "status": "pickup_complete",
    "quote_id": "quote_123",
    "tracking_url": "https://track.example.com/delivery_123"
  }
}
```

## Related References

- [Delivery Capability](delivery.md)
- [Payment Handler Guide](../payment-handler-guide.md)
- [Payment Handler Template](../payment-handler-template.md)
- [Tokenization Guide](../tokenization-guide.md)
- [Delivery-First Auth/Capture Example](../examples/delivery-first-payment-handler.md)
- [Platform Tokenizer Example](../examples/platform-tokenizer-payment-handler.md)
- [Business Tokenizer Example](../examples/business-tokenizer-payment-handler.md)
- [Encrypted Credential Example](../examples/encrypted-credential-handler.md)
- [Localprotocol Auth/Capture Example](../examples/localprotocol-auth-capture-handler.md)
