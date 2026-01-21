# Merchant Capability - REST Binding

This document specifies the HTTP/REST binding for the [Merchant Capability](https://ucp.dev/specification/commerce/merchant/index.md).

## Protocol Fundamentals

### Discovery

Businesses advertise REST transport availability through their UCP profile at `/.well-known/ucp`.

```json
{
  "ucp": {
    "version": "2026-01-11",
    "services": {
      "xyz.localprotocol.commerce": {
        "version": "2026-01-11",
        "spec": "https://localprotocol.xyz/specification/overview",
        "rest": {
          "schema": "https://localprotocol.xyz/services/commerce/rest.openapi.json",
          "endpoint": "https://business.example.com/ucp"
        }
      }
    },
    "capabilities": [
      {
        "name": "xyz.localprotocol.commerce.merchant",
        "version": "2026-01-11",
        "spec": "https://localprotocol.xyz/specification/commerce/merchant",
        "schema": "https://localprotocol.xyz/schemas/commerce/merchant.json"
      }
    ]
  }
}
```

## Endpoints

| Endpoint            | Method | Operation                                                                             | Description           |
| ------------------- | ------ | ------------------------------------------------------------------------------------- | --------------------- |
| `/merchants/search` | POST   | [Search Merchants](https://ucp.dev/specification/commerce/merchant/#search-merchants) | Search for merchants. |
| `/merchants/{id}`   | GET    | [Get Merchant](https://ucp.dev/specification/commerce/merchant/#get-merchant)         | Get a merchant by ID. |

### `POST /merchants/search`

Maps to the [Search Merchants](https://ucp.dev/specification/commerce/merchant/#search-merchants) operation.

**Error:** Operation ID `search_merchants` not found.

#### Example

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

```json
{
  "ucp": {
    "version": "2026-01-11",
    "capabilities": [
      {
        "name": "xyz.localprotocol.commerce.merchant",
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

Maps to the [Get Merchant](https://ucp.dev/specification/commerce/merchant/#get-merchant) operation.

**Error:** Operation ID `get_merchant` not found.

#### Example

```http
GET /merchants/mch_abc123 HTTP/1.1
Host: business.example.com
```

```json
{
  "ucp": {
    "version": "2026-01-11",
    "capabilities": [
      {
        "name": "xyz.localprotocol.commerce.merchant",
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

| Status | Meaning                                                     |
| ------ | ----------------------------------------------------------- |
| 400    | Bad Request - Malformed JSON or missing required parameters |
| 401    | Unauthorized - Missing or invalid authentication            |
| 429    | Too Many Requests - Rate limited                            |
| 500    | Internal Server Error                                       |

### Business Outcomes

All application-level outcomes return HTTP 200 with the UCP envelope and optional `messages` array. See [Merchant Capability](https://ucp.dev/specification/commerce/merchant/#messages-and-error-handling) for message semantics and common scenarios.

**Example: Merchant Not Found**

```json
{
  "ucp": {
    "version": "2026-01-11",
    "capabilities": [
      {
        "name": "xyz.localprotocol.commerce.merchant",
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

The `merchant` field is omitted when the ID doesn't exist. Business outcomes use the standard HTTP 200 status with messages in the response body.

## Conformance

A conforming REST transport implementation **MUST**:

1. Implement the `POST /merchants/search` endpoint with required `query` parameter.
1. Implement the `GET /merchants/{id}` endpoint with required `id` path parameter.
1. Support cursor-based pagination with default limit of 10.
1. Return HTTP 200 with `NOT_FOUND` message for merchant requests with unknown IDs.
1. Validate request and response payloads against UCP schemas.
