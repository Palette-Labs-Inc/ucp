# Merchant Capability - MCP Binding

This document specifies the Model Context Protocol (MCP) binding for the [Merchant Capability](https://ucp.dev/specification/commerce/merchant/index.md).

## Protocol Fundamentals

### Discovery

Businesses advertise MCP transport availability through their UCP profile at `/.well-known/ucp`.

```json
{
  "ucp": {
    "version": "2026-01-11",
    "services": {
      "xyz.localprotocol.commerce": {
        "version": "2026-01-11",
        "spec": "https://localprotocol.xyz/specification/overview",
        "mcp": {
          "schema": "https://localprotocol.xyz/services/commerce/mcp.openrpc.json",
          "endpoint": "https://business.example.com/ucp/mcp"
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

### Platform Profile Advertisement

MCP clients **MUST** include the UCP platform profile URI with every request. The platform profile is included in the `_meta.ucp` structure within the request parameters:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "search_merchants",
  "params": {
    "_meta": {
      "ucp": {
        "profile": "https://platform.example/profiles/v2026-01/shopping-agent.json"
      }
    },
    "query": "late-night pizza",
    "context": {
      "country": "US",
      "intent": "delivery to downtown"
    }
  }
}
```

The `_meta.ucp.profile` field **MUST** be present in every MCP tool invocation to enable version compatibility checking and capability negotiation.

## Tools

UCP Capabilities map 1:1 to MCP Tools.

| Tool               | Operation                                                                             | Description           |
| ------------------ | ------------------------------------------------------------------------------------- | --------------------- |
| `search_merchants` | [Search Merchants](https://ucp.dev/specification/commerce/merchant/#search-merchants) | Search for merchants. |
| `get_merchant`     | [Get Merchant](https://ucp.dev/specification/commerce/merchant/#get-merchant)         | Get a merchant by ID. |

### `search_merchants`

Maps to the [Search Merchants](https://ucp.dev/specification/commerce/merchant/#search-merchants) operation.

**Error:** Operation ID `search_merchants` not found.

#### Example

```json
{
  "jsonrpc": "2.0",
  "method": "search_merchants",
  "params": {
    "_meta": {
      "ucp": {
        "profile": "https://platform.example/profiles/v2026-01/shopping-agent.json"
      }
    },
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
  },
  "id": 1
}
```

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
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
        "category": "Restaurants > Pizza",
      }
    ],
    "pagination": {
      "cursor": "eyJwYWdlIjoxfQ==",
      "has_next_page": true,
      "total_count": 42
    }
  }
}
```

### `get_merchant`

Maps to the [Get Merchant](https://ucp.dev/specification/commerce/merchant/#get-merchant) operation.

**Error:** Operation ID `get_merchant` not found.

#### Example

```json
{
  "jsonrpc": "2.0",
  "method": "get_merchant",
  "params": {
    "_meta": {
      "ucp": {
        "profile": "https://platform.example/profiles/v2026-01/shopping-agent.json"
      }
    },
    "id": "mch_abc123",
    "context": {
      "country": "US"
    }
  },
  "id": 2
}
```

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
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
      "category": "Restaurants > Pizza"
    }
  }
}
```

## Error Handling

UCP uses a two-layer error model separating transport errors from business outcomes.

### Transport Errors

Use JSON-RPC 2.0 error codes for protocol-level issues that prevent request processing:

| Code   | Meaning                                     |
| ------ | ------------------------------------------- |
| -32600 | Invalid Request - Malformed JSON-RPC        |
| -32601 | Method not found                            |
| -32602 | Invalid params - Missing required parameter |
| -32603 | Internal error                              |

### Business Outcomes

All application-level outcomes return a successful JSON-RPC result with the UCP envelope and optional `messages` array. See [Merchant Capability](https://ucp.dev/specification/commerce/merchant/#messages-and-error-handling) for message semantics and common scenarios.

**Example: Merchant Not Found**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
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
}
```

The `merchant` field is omitted when the ID doesn't exist. Business outcomes use the JSON-RPC `result` field with messages in the response payload.

## Conformance

A conforming MCP transport implementation **MUST**:

1. Implement JSON-RPC 2.0 protocol correctly.
1. Provide both `search_merchants` and `get_merchant` tools.
1. Require `query` parameter for `search_merchants`.
1. Require `id` parameter for `get_merchant`.
1. Use JSON-RPC errors for transport issues; use `messages` array for business outcomes.
1. Return successful result with `NOT_FOUND` message for unknown merchant IDs.
1. Validate tool inputs against UCP schemas.
1. Support cursor-based pagination with default limit of 10.
