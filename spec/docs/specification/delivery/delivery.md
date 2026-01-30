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

# Delivery Capability

* **Capability Name:** `xyz.localprotocol.delivery`
* **Version:** `2026-01-19`

## Overview

The delivery capability provides a standalone API for on-demand delivery,
including delivery quote retrieval, delivery creation, and lifecycle tracking.
It is designed to power restaurant delivery flows and any other use case where
pickup + dropoff logistics are handled by a delivery platform.

The delivery service endpoint is discovered via `/.well-known/ucp` in:

* `services["xyz.localprotocol.delivery"].rest.endpoint`

### Payment Requirement

Delivery is standalone (no shopping checkout required), but **payment is
mandatory** for delivery creation. Platforms MUST:

1. Fetch `payment.handlers` from the delivery quote response.
2. Acquire a payment instrument using the handler specification.
3. Submit `payment_data` when creating the delivery.

This mirrors the UCP payment handler model, but applies it to delivery quotes
and delivery creation instead of checkout completion.

See:

- [Delivery Lifecycle & Payments](delivery-lifecycle.md)
- [Payment Handler Guide](../payment-handler-guide.md)
- [Payment Handler Template](../payment-handler-template.md)
- [Tokenization Guide](../tokenization-guide.md)
- [Platform Tokenizer Example](../examples/platform-tokenizer-payment-handler.md)
- [Business Tokenizer Example](../examples/business-tokenizer-payment-handler.md)
- [Encrypted Credential Example](../examples/encrypted-credential-handler.md)
- [Localprotocol Auth/Capture Example](../examples/localprotocol-auth-capture-handler.md)
- [Delivery-First Auth/Capture Example](../examples/delivery-first-payment-handler.md)

### Handler Patterns for Delivery

Delivery fees are often captured after fulfillment. Common patterns:

- **Authorize/Capture** for delivery-friendly timing and escrow.
- **Processor Tokenizer** when PSP tokenizes and processes without detokenize.
- **Platform Tokenizer / Encrypted Credential** when platforms operate a
  compliant credential provider and hand off secure payloads.

## Quote Retrieval Flow

Delivery quotes let platforms price and validate on-demand delivery before
checkout completion. Quotes are time-bound and must be refreshed when expired.

**Request:**

* Use `delivery_request` with pickup, dropoff, timing, and items value.
* Optionally include `context` to resolve region/market preferences.

**Response:**

* `quote_id` is required for subsequent reference.
* `expires_at` indicates quote validity window.
* `totals` contain delivery pricing.
* `payment.handlers` are **required** and define how platforms must acquire
  payment instruments for delivery creation.

**Quote Refresh:**

* If `expires_at` is in the past, request a new quote.
* Embedded clients may receive `ed.delivery.quote_change` events.

### Quote Request Example

```json
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
    },
    "external_store_id": "store_1"
  }
}
```

### Quote Response Example

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

## Delivery Creation Flow (Payment Required)

Deliveries are created using a `delivery_request` plus **required** `payment_data`.
The payment instrument MUST be produced using one of the handler declarations
from the quote response.

### Create Delivery Example

```json
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
    },
    "external_store_id": "store_1"
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

### Payment Binding Requirements

Payment credentials MUST be bound to the delivery context to prevent replay:

- Bind to `quote_id` whenever possible (preferred).
- Bind to `delivery_id` after creation when required by the handler.
- Use `PaymentIdentity` from the handler configuration when acting on behalf of
  another participant (PSP or platform tokenizer).

See [Tokenization Guide](../tokenization-guide.md) for binding requirements and
examples.

## Delivery Lifecycle

Once created, the delivery progresses through status updates and can be tracked
via polling or events.

### Status Progression (Typical)

```
pending → pickup → pickup_complete → dropoff → delivered
```

### Other Statuses

* `canceled` — delivery was canceled before completion
* `returned` — delivery failed and was returned
* `ongoing` — in-progress but does not map to a specific step

### Event Tracking

Delivery event payloads use the same status enum and include the current
delivery snapshot:

* Webhook: `delivery_event_webhook` (REST)
* Embedded: `ed.delivery.event`, `ed.delivery.change`

## Operations

| Operation | Description |
| :--- | :--- |
| **Create Delivery Quote** | Get pricing and availability for a delivery request. |
| **Create Delivery** | Create a delivery from pickup + dropoff inputs and required payment data. |
| **Get Delivery** | Retrieve a delivery by ID. |
| **List Deliveries** | List deliveries with status filtering and pagination. |
| **Update Delivery** | Update patchable delivery fields (timing, addresses, value). |
| **Cancel Delivery** | Cancel a delivery before completion. |

## Schema References

* Delivery capability: `spec/source/schemas/delivery/delivery.json`
* Delivery resource: `spec/source/schemas/delivery/types/delivery.json`
* Quote: `spec/source/schemas/delivery/types/quote.json`
* Delivery inputs: `spec/source/schemas/delivery/types/delivery_inputs.json`
* Payment handlers: `spec/source/schemas/shopping/payment.json`
* Payment data: `spec/source/schemas/shopping/payment_data.json`