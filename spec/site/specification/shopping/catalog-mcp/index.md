# Catalog Capability - MCP Binding

This document specifies the Model Context Protocol (MCP) binding for the [Catalog Capability](https://ucp.dev/specification/shopping/catalog/index.md).

## Protocol Fundamentals

### Discovery

Businesses advertise MCP transport availability through their UCP profile at `/.well-known/ucp`.

```json
{
  "ucp": {
    "version": "2026-01-11",
    "services": {
      "dev.ucp.shopping": {
        "version": "2026-01-11",
        "spec": "https://ucp.dev/specification/overview",
        "mcp": {
          "schema": "https://ucp.dev/services/shopping/mcp.openrpc.json",
          "endpoint": "https://business.example.com/ucp/mcp"
        }
      }
    },
    "capabilities": [
      {
        "name": "dev.ucp.shopping.catalog",
        "version": "2026-01-11",
        "spec": "https://ucp.dev/specification/shopping/catalog",
        "schema": "https://ucp.dev/schemas/shopping/catalog.json"
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
  "method": "search_catalog",
  "params": {
    "_meta": {
      "ucp": {
        "profile": "https://platform.example/profiles/v2026-01/shopping-agent.json"
      }
    },
    "query": "blue running shoes",
    "context": {
      "country": "US",
      "intent": "looking for comfortable everyday shoes"
    }
  }
}
```

The `_meta.ucp.profile` field **MUST** be present in every MCP tool invocation to enable version compatibility checking and capability negotiation.

## Tools

UCP Capabilities map 1:1 to MCP Tools.

| Tool               | Operation                                                                            | Description                     |
| ------------------ | ------------------------------------------------------------------------------------ | ------------------------------- |
| `search_catalog`   | [Search Catalog](https://ucp.dev/specification/shopping/catalog/#search-catalog)     | Search for products.            |
| `get_catalog_item` | [Get Catalog Item](https://ucp.dev/specification/shopping/catalog/#get-catalog-item) | Get a product or variant by ID. |

### `search_catalog`

Maps to the [Search Catalog](https://ucp.dev/specification/shopping/catalog/#search-catalog) operation.

**Inputs**

| Name       | Type                                                                          | Required | Description             |
| ---------- | ----------------------------------------------------------------------------- | -------- | ----------------------- |
| query      | string                                                                        | **Yes**  | Free-text search query. |
| context    | [Context](/specification/shopping/catalog-mcp/#context)                       | No       |                         |
| filters    | [Search Filters](/specification/shopping/catalog-mcp/#search-filters)         | No       |                         |
| pagination | [Pagination Request](/specification/shopping/catalog-mcp/#pagination-request) | No       |                         |

**Output**

| Name       | Type                                                                            | Required | Description                                                           |
| ---------- | ------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------- |
| ucp        | [Ucp Response](/specification/shopping/catalog-mcp/#ucp-response)               | **Yes**  |                                                                       |
| products   | Array\[[Product](/specification/shopping/catalog-mcp/#product)\]                | **Yes**  | Products matching the search criteria.                                |
| pagination | [Pagination Response](/specification/shopping/catalog-mcp/#pagination-response) | No       |                                                                       |
| messages   | Array\[[Message](/specification/shopping/catalog-mcp/#message)\]                | No       | Errors, warnings, or informational messages about the search results. |

#### Example

```json
{
  "jsonrpc": "2.0",
  "method": "search_catalog",
  "params": {
    "_meta": {
      "ucp": {
        "profile": "https://platform.example/profiles/v2026-01/shopping-agent.json"
      }
    },
    "query": "blue running shoes",
    "context": {
      "country": "US",
      "region": "CA",
      "intent": "looking for comfortable everyday shoes"
    },
    "filters": {
      "category": "Footwear",
      "price": {
        "max": 15000
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
          "name": "dev.ucp.shopping.catalog",
          "version": "2026-01-11"
        }
      ]
    },
    "products": [
      {
        "id": "prod_abc123",
        "handle": "blue-runner-pro",
        "title": "Blue Runner Pro",
        "description": {
          "plain": "Lightweight running shoes with responsive cushioning."
        },
        "url": "https://business.example.com/products/blue-runner-pro",
        "category": "Footwear > Running",
        "price": {
          "min": { "amount": 12000, "currency": "USD" },
          "max": { "amount": 12000, "currency": "USD" }
        },
        "media": [
          {
            "type": "image",
            "url": "https://cdn.example.com/products/blue-runner-pro.jpg",
            "alt_text": "Blue Runner Pro running shoes"
          }
        ],
        "options": [
          {
            "name": "Size",
            "values": [{"label": "8"}, {"label": "9"}, {"label": "10"}, {"label": "11"}, {"label": "12"}]
          }
        ],
        "variants": [
          {
            "id": "prod_abc123_size10",
            "sku": "BRP-BLU-10",
            "title": "Size 10",
            "description": { "plain": "Size 10 variant" },
            "price": { "amount": 12000, "currency": "USD" },
            "availability": { "available": true },
            "selected_options": [
              { "name": "Size", "label": "10" }
            ],
            "tags": ["running", "road", "neutral"],
            "seller": {
              "name": "Example Store",
              "links": [
                { "type": "refund_policy", "url": "https://business.example.com/policies/refunds" }
              ]
            }
          }
        ],
        "rating": {
          "value": 4.5,
          "scale_max": 5,
          "count": 128
        },
        "metadata": {
          "collection": "Winter 2026",
          "technology": {
            "midsole": "React foam",
            "outsole": "Continental rubber"
          }
        }
      }
    ],
    "pagination": {
      "cursor": "eyJwYWdlIjoxfQ==",
      "has_next_page": true,
      "total_count": 47
    }
  }
}
```

### `get_catalog_item`

Maps to the [Get Catalog Item](https://ucp.dev/specification/shopping/catalog/#get-catalog-item) operation.

The `id` parameter accepts either a product ID or variant ID. The response MUST return the parent product with full context. For product ID lookups, `variants` MAY contain a representative set (when the full set is large, based on buyer context or other criteria). For variant ID lookups, `variants` MUST contain only the requested variant.

**Inputs**

| Name | Type   | Required | Description                                            |
| ---- | ------ | -------- | ------------------------------------------------------ |
| id   | string | **Yes**  | Global ID (GID) of product or variant.Defined in path. |

**Output**

| Name     | Type                                                              | Required | Description                                                                                                                                                                       |
| -------- | ----------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ucp      | [Ucp Response](/specification/shopping/catalog-mcp/#ucp-response) | **Yes**  |                                                                                                                                                                                   |
| product  | [Product](/specification/shopping/catalog-mcp/#product)           | No       | The product containing the requested ID. For product ID lookups, variants may contain a representative set. For variant ID lookups, variants contains only the requested variant. |
| messages | Array\[[Message](/specification/shopping/catalog-mcp/#message)\]  | No       | Errors, warnings, or informational messages about the requested item.                                                                                                             |

#### Example

```json
{
  "jsonrpc": "2.0",
  "method": "get_catalog_item",
  "params": {
    "_meta": {
      "ucp": {
        "profile": "https://platform.example/profiles/v2026-01/shopping-agent.json"
      }
    },
    "id": "prod_abc123",
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
          "name": "dev.ucp.shopping.catalog",
          "version": "2026-01-11"
        }
      ]
    },
    "product": {
      "id": "prod_abc123",
      "title": "Blue Runner Pro",
      "description": {
        "plain": "Lightweight running shoes with responsive cushioning."
      },
      "price": {
        "min": { "amount": 12000, "currency": "USD" },
        "max": { "amount": 12000, "currency": "USD" }
      },
      "variants": [
        {
          "id": "prod_abc123_size10",
          "sku": "BRP-BLU-10",
          "title": "Size 10",
          "description": { "plain": "Size 10 variant" },
          "price": { "amount": 12000, "currency": "USD" },
          "availability": { "available": true },
          "tags": ["running", "road", "neutral"],
          "seller": {
            "name": "Example Store",
            "links": [
              { "type": "refund_policy", "url": "https://business.example.com/policies/refunds" }
            ]
          }
        }
      ],
      "metadata": {
        "collection": "Winter 2026",
        "technology": {
          "midsole": "React foam",
          "outsole": "Continental rubber"
        }
      }
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

All application-level outcomes return a successful JSON-RPC result with the UCP envelope and optional `messages` array. See [Catalog Capability](https://ucp.dev/specification/shopping/catalog/#messages-and-error-handling) for message semantics and common scenarios.

**Example: Product Not Found**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "ucp": {
      "version": "2026-01-11",
      "capabilities": [
        {
          "name": "dev.ucp.shopping.catalog",
          "version": "2026-01-11"
        }
      ]
    },
    "messages": [
      {
        "type": "error",
        "code": "NOT_FOUND",
        "content": "The requested product ID does not exist",
        "severity": "recoverable"
      }
    ]
  }
}
```

The `product` field is omitted when the ID doesn't exist. Business outcomes use the JSON-RPC `result` field with messages in the response payload.

## Conformance

A conforming MCP transport implementation **MUST**:

1. Implement JSON-RPC 2.0 protocol correctly.
1. Provide both `search_catalog` and `get_catalog_item` tools.
1. Require `query` parameter for `search_catalog`.
1. Require `id` parameter for `get_catalog_item`.
1. Use JSON-RPC errors for transport issues; use `messages` array for business outcomes.
1. Return successful result with `NOT_FOUND` message for unknown product/variant IDs.
1. Validate tool inputs against UCP schemas.
1. Return products with valid `Price` objects (amount + currency).
1. Support cursor-based pagination with default limit of 10.
