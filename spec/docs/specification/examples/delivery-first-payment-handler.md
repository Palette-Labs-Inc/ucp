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

# Delivery-First Auth/Capture Payment Handler

* **Handler Name:** `xyz.localprotocol.delivery.auth_capture`
* **Version:** `2026-01-19`
* **Type:** Payment Handler Example

## Introduction

This example describes a **delivery-first** payment handler where the delivery
service is the Merchant of Record (MoR) for delivery fees. Payment authorization
occurs at **delivery creation**, and capture happens when the delivery reaches a
terminal event (typically `delivered`).

Unlike shopping checkout, handler discovery happens in the **delivery quote**
response, and binding uses `quote_id` (preferred) instead of `checkout_id`.

### Key Benefits

- **Delivery-native binding:** Tokens bind to `quote_id` or `delivery_id`.
- **Capture on fulfillment:** Aligns with courier completion.
- **Standalone:** No shopping checkout required.

### Quick Start

| If you are a... | Start here |
|:----------------|:-----------|
| **Delivery Service** advertising this handler | [Service Integration](#service-integration) |
| **Platform** requesting delivery | [Platform Integration](#platform-integration) |

---

## Participants

| Participant | Role | Prerequisites |
|:------------|:-----|:--------------|
| **Delivery Service** | Advertises handler config, authorizes and captures delivery fees | Yes |
| **Platform** | Discovers handler, acquires authorization instrument, submits payment_data | Yes |
| **PSP** | Processes authorization/capture on behalf of delivery service | Yes |

---

## Service Integration

### Prerequisites

Before advertising this handler, delivery services **MUST** complete:

1. Onboard with a PSP that supports authorize/capture flows.
2. Obtain a delivery-merchant identity used for token binding.

**Prerequisites Output:**

| Field | Description |
|:------|:------------|
| `identity.access_token` | Delivery merchant identifier issued by PSP |
| PSP credentials | API credentials for authorization and capture |

### Handler Configuration

Delivery services advertise this handler in **delivery quote** responses under
`payment.handlers`.

#### Example Handler Declaration (Quote Response)

```json
{
  "payment": {
    "handlers": [
      {
        "id": "delivery_auth_capture",
        "name": "xyz.localprotocol.delivery.auth_capture",
        "version": "2026-01-19",
        "spec": "https://localprotocol.xyz/handlers/delivery-auth-capture",
        "config_schema": "https://localprotocol.xyz/handlers/delivery-auth-capture/config.json",
        "instrument_schemas": [
          "https://localprotocol.xyz/handlers/delivery-auth-capture/instrument.json"
        ],
        "config": {
          "psp_endpoint": "https://api.psp.example/v1/authorize",
          "identity": { "access_token": "delivery_merchant_123" },
          "authorization_expiry_seconds": 1800,
          "capture_on_event": "delivered",
          "environment": "production"
        }
      }
    ]
  }
}
```

### Processing

Delivery services **MUST**:

1. **Validate Handler:** Ensure `payment_data.handler_id` matches the handler instance.
2. **Validate Binding:** Verify the instrument is bound to the `quote_id` or
   `delivery_id`.
3. **Authorize** at delivery creation.
4. **Capture** upon `delivery_event.event_type = delivered` (or configured event).

---

## Platform Integration

### Prerequisites

Platforms **MUST**:

1. Support the handler’s credential acquisition flow.
2. Bind credentials to the delivery context (prefer `quote_id`).

### Payment Protocol

#### Step 1: Discover Handler

Read `payment.handlers` from the delivery quote response.

#### Step 2: Acquire Authorization Instrument

Use the handler’s `spec` and `config` to create a payment instrument bound to
`quote_id` and the handler `identity`.

#### Step 3: Create Delivery with payment_data

```json
POST /deliveries

{
  "delivery_request": { "...": "..." },
  "payment_data": {
    "id": "instr_1",
    "handler_id": "delivery_auth_capture",
    "type": "delivery_auth_capture",
    "authorization_id": "auth_abc123",
    "credential": {
      "type": "token",
      "token": "tok_delivery_auth_123"
    },
    "binding": {
      "quote_id": "quote_123",
      "identity": { "access_token": "delivery_merchant_123" }
    }
  }
}
```

---

## Binding Requirements

Delivery-first handlers **MUST** bind credentials to delivery context:

- **Preferred:** `quote_id`
- **Fallback:** `delivery_id` after creation

The processing participant **MUST** reject credentials with invalid or missing
delivery binding.

---

## Delivery Event Integration

Delivery services should align capture with delivery lifecycle events:

```json
{
  "event_id": "evt_456",
  "event_type": "delivered",
  "created_at": "2026-01-30T19:12:00Z",
  "delivery": {
    "id": "delivery_123",
    "status": "delivered",
    "quote_id": "quote_123"
  }
}
```

On `delivered`, capture the authorized payment.

---

## References

- [Payment Handler Guide](../payment-handler-guide.md)
- [Payment Handler Template](../payment-handler-template.md)
- [Tokenization Guide](../tokenization-guide.md)
- [Delivery Lifecycle & Payments](../delivery/delivery-lifecycle.md)
