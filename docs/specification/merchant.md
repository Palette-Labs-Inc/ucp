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

# Merchant Capability

* **Capability Name:** `dev.ucp.shopping.merchant`
* **Version:** `DRAFT`

## Overview

Allows platforms to search and browse merchants. This capability enables
merchant discovery before catalog exploration or checkout, supporting use cases
like:

* Free-text merchant search
* Category and filter-based browsing
* Direct merchant retrieval by ID

**Key Concepts**

* **Merchant**: A business entity available for discovery and commerce, with
  optional locations, media, and fulfillment capabilities.

## Operations

The Merchant capability defines the following logical operations.

| Operation | Description |
| :--- | :--- |
| **Search Merchants** | Search for merchants using query text and filters. |
| **Get Merchant** | Retrieve a specific merchant by ID. |

### Search Merchants

Performs a search against the business's merchant directory. Supports free-text
queries, filtering by category, and pagination.

**Use Cases:**

* User searches for "late-night pizza"
* Agent browses merchants in a category
* Platform fetches merchants near the buyer context

{{ method_fields('search_merchants', 'rest.openapi.json', 'merchant') }}

### Get Merchant

Retrieves a specific merchant by its Global ID (GID). Use this when you already
have an ID (e.g., from a saved list or search results).

{{ method_fields('get_merchant', 'rest.openapi.json', 'merchant') }}

## Entities

### Context

Location and market context for merchant operations. All fields are optional.
Platforms MAY geo-detect context from request IP/headers. When context fields
are provided, they MUST override any auto-detected values.

{{ extension_schema_fields('merchant.json#/$defs/context', 'merchant') }}

### Merchant

{{ schema_fields('types/merchant', 'merchant') }}

### Media

{{ schema_fields('types/media', 'merchant') }}

### Merchant Search Filters

Filter criteria for narrowing search results. Standard filters are defined below;
merchants MAY support additional custom filters via `additionalProperties`.

{{ schema_fields('types/merchant_search_filters', 'merchant') }}

### Pagination

Cursor-based pagination for list operations.

#### Pagination Request

{{ extension_schema_fields('types/pagination.json#/$defs/request', 'merchant') }}

#### Pagination Response

{{ extension_schema_fields('types/pagination.json#/$defs/response', 'merchant') }}

## Messages and Error Handling

All merchant responses include an optional `messages` array that allows
businesses to provide context about errors, warnings, or informational notices.

### Message Types

Messages communicate business outcomes and provide context:

| Type | When to Use | Example Codes |
| :--- | :--- | :--- |
| `error` | Business-level errors | `NOT_FOUND`, `REGION_RESTRICTED` |
| `warning` | Important conditions affecting use | `LIMITED_SERVICE_AREA`, `HOLIDAY_HOURS` |
| `info` | Additional context without issues | `PROMOTIONAL_OFFER` |

**Note**: All merchant errors use `severity: "recoverable"` - agents handle them
programmatically (retry, inform user, show alternatives).

#### Message (Error)

{{ schema_fields('types/message_error', 'merchant') }}

#### Message (Warning)

{{ schema_fields('types/message_warning', 'merchant') }}

#### Message (Info)

{{ schema_fields('types/message_info', 'merchant') }}

### Common Scenarios

**Empty Search**

When search finds no matches, return an empty array without messages.

```json
{
  "ucp": {...},
  "merchants": []
}
```

**Merchant Not Found**

When a requested merchant ID doesn't exist, return success with an error message
and omit the `merchant` field.

```json
{
  "ucp": {...},
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

Agents should handle this gracefully (e.g., ask user for a different merchant).

## Transport Bindings

The abstract operations above are bound to specific transport protocols as
defined below:

* [REST Binding](merchant-rest.md): RESTful API mapping.
* [MCP Binding](merchant-mcp.md): Model Context Protocol mapping via JSONRPC.
