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

# Merchant Capability - MCP Binding

This document specifies the Model Context Protocol (MCP) binding for the
[Merchant Capability](merchant.md).

## Protocol Fundamentals

### Discovery

Businesses advertise MCP transport availability through their UCP profile at
`/.well-known/ucp`.

```json
{
  "ucp": {
    "version": "2026-01-11",
    "services": {
      "dev.ucp.restaurant": {
        "version": "2026-01-11",
        "spec": "https://ucp.dev/specification/overview",
        "mcp": {
          "schema": "https://ucp.dev/services/restaurant/mcp.openrpc.json",
          "endpoint": "https://business.example.com/ucp/mcp"
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

### Platform Profile Advertisement

MCP clients **MUST** include the UCP platform profile URI with every request.
The platform profile is included in the `_meta.ucp` structure within the request
parameters:

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

The `_meta.ucp.profile` field **MUST** be present in every MCP tool invocation
to enable version compatibility checking and capability negotiation.

## Tools

UCP Capabilities map 1:1 to MCP Tools.

| Tool | Operation | Description |
| :--- | :--- | :--- |
| `search_merchants` | [Search Merchants](merchant.md#search-merchants) | Search for merchants. |
| `get_merchant` | [Get Merchant](merchant.md#get-merchant) | Get a merchant by ID. |

### `search_merchants`

Maps to the [Search Merchants](merchant.md#search-merchants) operation.

{{ method_fields('search_merchants', 'rest.openapi.json', 'merchant-mcp') }}

#### Example

=== "Request"

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

=== "Response"

    ```json
    {
      "jsonrpc": "2.0",
      "id": 1,
      "result": {
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

Maps to the [Get Merchant](merchant.md#get-merchant) operation.

{{ method_fields('get_merchant', 'rest.openapi.json', 'merchant-mcp') }}

#### Example

=== "Request"

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

=== "Response"

    ```json
    {
      "jsonrpc": "2.0",
      "id": 2,
      "result": {
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
          "category": "Restaurants > Pizza"
        }
      }
    }
    ```

## Error Handling

UCP uses a two-layer error model separating transport errors from business outcomes.

### Transport Errors

Use JSON-RPC 2.0 error codes for protocol-level issues that prevent request processing:

| Code | Meaning |
| :--- | :--- |
| -32600 | Invalid Request - Malformed JSON-RPC |
| -32601 | Method not found |
| -32602 | Invalid params - Missing required parameter |
| -32603 | Internal error |

### Business Outcomes

All application-level outcomes return a successful JSON-RPC result with the UCP
envelope and optional `messages` array. See [Merchant Capability](merchant.md#messages-and-error-handling)
for message semantics and common scenarios.

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
}
```

The `merchant` field is omitted when the ID doesn't exist. Business outcomes use
the JSON-RPC `result` field with messages in the response payload.

## Conformance

A conforming MCP transport implementation **MUST**:

1. Implement JSON-RPC 2.0 protocol correctly.
2. Provide both `search_merchants` and `get_merchant` tools.
3. Require `query` parameter for `search_merchants`.
4. Require `id` parameter for `get_merchant`.
5. Use JSON-RPC errors for transport issues; use `messages` array for business outcomes.
6. Return successful result with `NOT_FOUND` message for unknown merchant IDs.
7. Validate tool inputs against UCP schemas.
8. Support cursor-based pagination with default limit of 10.
