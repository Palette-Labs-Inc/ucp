# Merchant Capability

- **Capability Name:** `xyz.localprotocol.commerce.merchant`
- **Version:** `DRAFT`

## Overview

Allows platforms to search and browse merchants. This capability enables merchant discovery before catalog exploration or checkout, supporting use cases like:

- Free-text merchant search
- Category and filter-based browsing
- Direct merchant retrieval by ID

**Key Concepts**

- **Merchant**: A business entity available for discovery and commerce, with optional locations, media, and fulfillment capabilities.

## Operations

The Merchant capability defines the following logical operations.

| Operation            | Description                                        |
| -------------------- | -------------------------------------------------- |
| **Search Merchants** | Search for merchants using query text and filters. |
| **Get Merchant**     | Retrieve a specific merchant by ID.                |

### Search Merchants

Performs a search against the business's merchant directory. Supports free-text queries, filtering by category, and pagination.

**Use Cases:**

- User searches for "late-night pizza"
- Agent browses merchants in a category
- Platform fetches merchants near the buyer context

**Inputs**

| Name       | Type                                                                                 | Required | Description                               |
| ---------- | ------------------------------------------------------------------------------------ | -------- | ----------------------------------------- |
| query      | string                                                                               | **Yes**  | Free-text search query for merchant name. |
| context    | [Context](/specification/commerce/merchant/#context)                                 | No       |                                           |
| filters    | [Merchant Search Filters](/specification/commerce/merchant/#merchant-search-filters) | No       |                                           |
| pagination | [Pagination Request](/specification/commerce/merchant/#pagination-request)           | No       |                                           |

**Output**

| Name       | Type                                                                         | Required | Description                                                           |
| ---------- | ---------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------- |
| ucp        | [Ucp Response](/specification/commerce/merchant/#ucp-response)               | **Yes**  |                                                                       |
| merchants  | Array\[[Merchant](/specification/commerce/merchant/#merchant)\]              | **Yes**  | Merchants matching the search criteria.                               |
| pagination | [Pagination Response](/specification/commerce/merchant/#pagination-response) | No       |                                                                       |
| messages   | Array\[[Message](/specification/commerce/merchant/#message)\]                | No       | Errors, warnings, or informational messages about the search results. |

### Get Merchant

Retrieves a specific merchant by its Global ID (GID). Use this when you already have an ID (e.g., from a saved list or search results).

**Inputs**

| Name | Type   | Required | Description                                  |
| ---- | ------ | -------- | -------------------------------------------- |
| id   | string | **Yes**  | Global ID (GID) of merchant.Defined in path. |

**Output**

| Name     | Type                                                           | Required | Description                                                               |
| -------- | -------------------------------------------------------------- | -------- | ------------------------------------------------------------------------- |
| ucp      | [Ucp Response](/specification/commerce/merchant/#ucp-response) | **Yes**  |                                                                           |
| merchant | [Merchant](/specification/commerce/merchant/#merchant)         | No       | The merchant associated with the requested ID.                            |
| messages | Array\[[Message](/specification/commerce/merchant/#message)\]  | No       | Errors, warnings, or informational messages about the requested merchant. |

## Entities

### Context

Location and market context for merchant operations. All fields are optional. Platforms MAY geo-detect context from request IP/headers. When context fields are provided, they MUST override any auto-detected values.

| Name        | Type   | Required | Description                                                                                                                                           |
| ----------- | ------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| country     | string | No       | ISO 3166-1 alpha-2 country code (e.g., 'US', 'CA'). Market context for product availability, pricing, and currency. Detected from request if omitted. |
| region      | string | No       | State, province, emirate, or district (e.g., 'CA', 'ON', 'Dubai'). Format varies by country.                                                          |
| postal_code | string | No       | Postal or ZIP code for regional refinement. Not applicable in all countries.                                                                          |
| intent      | string | No       | Background context for semantic search (e.g., 'family-friendly restaurants', 'late-night delivery').                                                  |

### Merchant

| Name               | Type                                                                                            | Required | Description                                                                        |
| ------------------ | ----------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------- |
| id                 | string                                                                                          | **Yes**  | Global ID (GID) uniquely identifying this merchant.                                |
| name               | string                                                                                          | **Yes**  | Merchant display name.                                                             |
| description        | object                                                                                          | No       | Merchant description in one or more formats. At least one format must be provided. |
| url                | string                                                                                          | No       | Canonical merchant page URL.                                                       |
| category           | string                                                                                          | No       | Category: taxonomy path (e.g., 'Restaurants > Sushi') or merchant-defined type.    |
| media              | Array\[[Media](/specification/commerce/merchant/#media)\]                                       | No       | Merchant media (images, videos). First item is the featured media.                 |
| tags               | Array[string]                                                                                   | No       | Merchant tags for categorization and search.                                       |
| locations          | Array\[[Retail Location Response](/specification/commerce/merchant/#retail-location-response)\] | No       | Merchant retail locations (stores, pickup points, etc.).                           |
| fulfillment_config | [Merchant Fulfillment Config](/specification/commerce/merchant/#merchant-fulfillment-config)    | No       | Merchant fulfillment capabilities and constraints.                                 |
| metadata           | object                                                                                          | No       | Business-defined custom data extending the standard merchant model.                |

### Media

| Name     | Type    | Required | Description                                                      |
| -------- | ------- | -------- | ---------------------------------------------------------------- |
| type     | string  | **Yes**  | Media type discriminator. **Enum:** `image`, `video`, `model_3d` |
| url      | string  | **Yes**  | URL to the media resource.                                       |
| alt_text | string  | No       | Accessibility text describing the media.                         |
| width    | integer | No       | Width in pixels (for images/video).                              |
| height   | integer | No       | Height in pixels (for images/video).                             |

### Merchant Search Filters

Filter criteria for narrowing search results. Standard filters are defined below; merchants MAY support additional custom filters via `additionalProperties`.

| Name               | Type    | Required | Description                                                                                                 |
| ------------------ | ------- | -------- | ----------------------------------------------------------------------------------------------------------- |
| category           | string  | No       | Filter by merchant category. Categories are merchant-defined strings representing merchant taxonomy.        |
| open_now           | boolean | No       | Whether the merchant is open at request time.                                                               |
| fulfillment_method | string  | No       | Required fulfillment method type for the merchant. **Enum:** `shipping`, `pickup`                           |
| location           | object  | No       | Filter by location using address fields and an optional radius. Partial matches are implementation-defined. |

### Pagination

Cursor-based pagination for list operations.

#### Pagination Request

| Name   | Type    | Required | Description                           |
| ------ | ------- | -------- | ------------------------------------- |
| cursor | string  | No       | Opaque cursor from previous response. |
| limit  | integer | No       | Maximum number of results to return.  |

#### Pagination Response

| Name          | Type    | Required | Description                                    |
| ------------- | ------- | -------- | ---------------------------------------------- |
| cursor        | string  | No       | Cursor to fetch the next page of results.      |
| has_next_page | boolean | No       | Whether more results are available.            |
| total_count   | integer | No       | Total number of matching items (if available). |

## Messages and Error Handling

All merchant responses include an optional `messages` array that allows businesses to provide context about errors, warnings, or informational notices.

### Message Types

Messages communicate business outcomes and provide context:

| Type      | When to Use                        | Example Codes                           |
| --------- | ---------------------------------- | --------------------------------------- |
| `error`   | Business-level errors              | `NOT_FOUND`, `REGION_RESTRICTED`        |
| `warning` | Important conditions affecting use | `LIMITED_SERVICE_AREA`, `HOLIDAY_HOURS` |
| `info`    | Additional context without issues  | `PROMOTIONAL_OFFER`                     |

**Note**: All merchant errors use `severity: "recoverable"` - agents handle them programmatically (retry, inform user, show alternatives).

#### Message (Error)

| Name         | Type   | Required | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------------ | ------ | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| type         | string | **Yes**  | **Constant = error**. Message type discriminator.                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| code         | string | **Yes**  | Error code. Possible values include: missing, invalid, out_of_stock, payment_declined, requires_sign_in, requires_3ds, requires_identity_linking. Freeform codes also allowed.                                                                                                                                                                                                                                                                                                                                 |
| path         | string | No       | RFC 9535 JSONPath to the component the message refers to (e.g., $.items[1]).                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| content_type | string | No       | Content format, default = plain. **Enum:** `plain`, `markdown`                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| content      | string | **Yes**  | Human-readable message.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| severity     | string | **Yes**  | Declares who resolves this error. 'recoverable': agent can fix via API. 'requires_buyer_input': merchant requires information their API doesn't support collecting programmatically (checkout incomplete). 'requires_buyer_review': buyer must authorize before order placement due to policy, regulatory, or entitlement rules (checkout complete). Errors with 'requires\_*' severity contribute to 'status: requires_escalation'.* *Enum:*\* `recoverable`, `requires_buyer_input`, `requires_buyer_review` |

#### Message (Warning)

| Name         | Type   | Required | Description                                                                                                                           |
| ------------ | ------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| type         | string | **Yes**  | **Constant = warning**. Message type discriminator.                                                                                   |
| path         | string | No       | JSONPath (RFC 9535) to related field (e.g., $.line_items[0]).                                                                         |
| code         | string | **Yes**  | Warning code. Machine-readable identifier for the warning type (e.g., final_sale, prop65, fulfillment_changed, age_restricted, etc.). |
| content      | string | **Yes**  | Human-readable warning message that MUST be displayed.                                                                                |
| content_type | string | No       | Content format, default = plain. **Enum:** `plain`, `markdown`                                                                        |

#### Message (Info)

| Name         | Type   | Required | Description                                                    |
| ------------ | ------ | -------- | -------------------------------------------------------------- |
| type         | string | **Yes**  | **Constant = info**. Message type discriminator.               |
| path         | string | No       | RFC 9535 JSONPath to the component the message refers to.      |
| code         | string | No       | Info code for programmatic handling.                           |
| content_type | string | No       | Content format, default = plain. **Enum:** `plain`, `markdown` |
| content      | string | **Yes**  | Human-readable message.                                        |

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

When a requested merchant ID doesn't exist, return success with an error message and omit the `merchant` field.

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

The abstract operations above are bound to specific transport protocols as defined below:

- [REST Binding](https://ucp.dev/specification/commerce/merchant-rest/index.md): RESTful API mapping.
- [MCP Binding](https://ucp.dev/specification/commerce/merchant-mcp/index.md): Model Context Protocol mapping via JSONRPC.
