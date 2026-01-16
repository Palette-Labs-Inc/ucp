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

# Merchant Capability - REST Binding

This document specifies the HTTP/REST binding for the
[Merchant Capability](merchant.md).

## Protocol Fundamentals

### Discovery

Businesses advertise REST transport availability through their UCP profile at
`/.well-known/ucp`.

```json
{
  "ucp": {
    "version": "2026-01-11",
    "services": {
      "dev.ucp.restaurant": {
        "version": "2026-01-11",
        "spec": "https://ucp.dev/specification/overview",
        "rest": {
          "schema": "https://ucp.dev/services/restaurant/rest.openapi.json",
          "endpoint": "https://business.example.com/ucp"
        }
      }
    },
    "capabilities": [
      {
        "name": "dev.ucp.menu.merchant",
        "version": "2026-01-11",
        "spec": "https://ucp.dev/specification/merchant",
        "schema": "https://ucp.dev/schemas/menu/merchant.json"
      }
    ]
  }
}
```

## Endpoints

| Endpoint | Method | Operation | Description |
| :--- | :--- | :--- | :--- |
| `/merchants/search` | POST | [Search Merchants](merchant.md#search-merchants) | Search for merchants. |
| `/merchants/{id}` | GET | [Get Merchant](merchant.md#get-merchant) | Get a merchant by ID. |

### `POST /merchants/search`

Maps to the [Search Merchants](merchant.md#search-merchants) operation.

{{ method_fields('search_merchants', 'rest.openapi.json', 'merchant-rest') }}

#### Example

=== "Request"

    ```json
    {
      "query": "late-night pizza",
      "context": {
        "country": "US",
        "region": "CA",
        "intent": "delivery to downtown"
      },
      "filters": {
        "category": "Restaurants",
        "open_now": true,
        "fulfillment_method": "shipping",
        "location": {
          "address": {
            "address_locality": "San Francisco",
            "address_region": "CA",
            "postal_code": "94105",
            "address_country": "US"
          },
          "radius": {
            "value": 8,
            "unit": "mi"
          }
        }
      },
      "pagination": {
        "limit": 20
      }
    }
    ```

=== "Response"

    ```json
    {
      "ucp": {
        "version": "2026-01-11",
        "capabilities": [
          {
            "name": "dev.ucp.menu.merchant",
            "version": "2026-01-11"
          }
        ]
      },
      "merchants": [
        {
          "id": "mch_abc123",
          "name": "Night Owl Pizza",
          "description": {
            "plain": "Late-night pizza and calzones."
          },
          "url": "https://nightowl.example.com",
          "category": "Restaurants > Pizza",
          "media": [
            {
              "type": "image",
              "url": "https://cdn.example.com/merchants/night-owl.jpg",
              "alt_text": "Night Owl Pizza storefront"
            }
          ],
          "locations": [
            {
              "id": "loc_1",
              "name": "Downtown",
              "address": {
                "street_address": "123 Market St",
                "address_locality": "San Francisco",
                "address_region": "CA",
                "postal_code": "94105",
                "address_country": "US"
              }
            }
          ],
          "fulfillment_config": {
            "allows_multi_destination": {
              "shipping": false,
              "pickup": true
            },
            "allows_method_combinations": [["pickup"]]
          }
        }
      ],
      "pagination": {
        "cursor": "eyJwYWdlIjoxfQ==",
        "has_next_page": true,
        "total_count": 42
      }
    }
    ```

### `GET /merchants/{id}`

Maps to the [Get Merchant](merchant.md#get-merchant) operation.

{{ method_fields('get_merchant', 'rest.openapi.json', 'merchant-rest') }}

#### Example

=== "Request"

    ```http
    GET /merchants/mch_abc123 HTTP/1.1
    Host: business.example.com
    ```

=== "Response"

    ```json
    {
      "ucp": {
        "version": "2026-01-11",
        "capabilities": [
          {
            "name": "dev.ucp.menu.merchant",
            "version": "2026-01-11"
          }
        ]
      },
      "merchant": {
        "id": "mch_abc123",
        "name": "Night Owl Pizza",
        "description": {
          "plain": "Late-night pizza and calzones."
        },
        "url": "https://nightowl.example.com",
        "category": "Restaurants > Pizza"
      }
    }
    ```

## Error Handling

UCP uses a two-layer error model separating transport errors from business outcomes.

### Transport Errors

Use HTTP status codes for protocol-level issues that prevent request processing:

| Status | Meaning |
| :--- | :--- |
| 400 | Bad Request - Malformed JSON or missing required parameters |
| 401 | Unauthorized - Missing or invalid authentication |
| 429 | Too Many Requests - Rate limited |
| 500 | Internal Server Error |

### Business Outcomes

All application-level outcomes return HTTP 200 with the UCP envelope and optional
`messages` array. See [Merchant Capability](merchant.md#messages-and-error-handling)
for message semantics and common scenarios.

**Example: Merchant Not Found**

```json
{
  "ucp": {
    "version": "2026-01-11",
    "capabilities": [
      {
        "name": "dev.ucp.menu.merchant",
        "version": "2026-01-11"
      }
    ]
  },
  "messages": [
    {
      "type": "error",
      "code": "NOT_FOUND",
      "content": "The requested merchant ID does not exist",
      "severity": "recoverable"
    }
  ]
}
```

The `merchant` field is omitted when the ID doesn't exist. Business outcomes use
the standard HTTP 200 status with messages in the response body.

## Conformance

A conforming REST transport implementation **MUST**:

1. Implement the `POST /merchants/search` endpoint with required `query` parameter.
2. Implement the `GET /merchants/{id}` endpoint with required `id` path parameter.
3. Support cursor-based pagination with default limit of 10.
4. Return HTTP 200 with `NOT_FOUND` message for merchant requests with unknown IDs.
5. Validate request and response payloads against UCP schemas.
