# Catalog Capability

- **Capability Name:** `dev.ucp.shopping.catalog`
- **Version:** `DRAFT`

## Overview

Allows platforms to search and browse business product catalogs. This capability enables product discovery before checkout, supporting use cases like:

- Free-text product search
- Category and filter-based browsing
- Direct product/variant retrieval by ID
- Price comparison across variants

**Key Concepts**

- **Product**: A catalog entry with title, description, media, and one or more variants.
- **Variant**: A purchasable SKU with specific option selections (e.g., "Blue / Large"), price, and availability.
- **Price**: Price values include both amount (in minor currency units) and currency code, enabling multi-currency catalogs.

**Relationship to Checkout**

Catalog operations return product and variant IDs that can be used directly in checkout `line_items[].item.id`. The variant ID from catalog retrieval should match the item ID expected by checkout.

## Operations

The Catalog capability defines the following logical operations.

| Operation            | Description                                       |
| -------------------- | ------------------------------------------------- |
| **Search Catalog**   | Search for products using query text and filters. |
| **Get Catalog Item** | Retrieve a specific product or variant by ID.     |

### Search Catalog

Performs a search against the business's product catalog. Supports free-text queries, filtering by category and price, and pagination.

**Use Cases:**

- User searches for "blue running shoes"
- Agent browses products in a category
- Platform fetches featured or trending products

**Inputs**

| Name       | Type                                                                      | Required | Description             |
| ---------- | ------------------------------------------------------------------------- | -------- | ----------------------- |
| query      | string                                                                    | **Yes**  | Free-text search query. |
| context    | [Context](/specification/shopping/catalog/#context)                       | No       |                         |
| filters    | [Search Filters](/specification/shopping/catalog/#search-filters)         | No       |                         |
| pagination | [Pagination Request](/specification/shopping/catalog/#pagination-request) | No       |                         |

**Output**

| Name       | Type                                                                        | Required | Description                                                           |
| ---------- | --------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------- |
| ucp        | [Ucp Response](/specification/shopping/catalog/#ucp-response)               | **Yes**  |                                                                       |
| products   | Array\[[Product](/specification/shopping/catalog/#product)\]                | **Yes**  | Products matching the search criteria.                                |
| pagination | [Pagination Response](/specification/shopping/catalog/#pagination-response) | No       |                                                                       |
| messages   | Array\[[Message](/specification/shopping/catalog/#message)\]                | No       | Errors, warnings, or informational messages about the search results. |

### Get Catalog Item

Retrieves a specific product or variant by its Global ID (GID). Use this when you already have an ID (e.g., from a saved list, deep link, or cart validation).

**Use Cases:**

- Validating cart items before checkout
- Fetching full product details from a product ID
- Resolving variant details for display

**ID Resolution Behavior:**

The `id` parameter accepts either a product ID or variant ID. The response MUST return the parent product with full context (title, description, media, options):

- **Product ID lookup**: `variants` MAY contain a representative set.
- **Variant ID lookup**: `variants` MUST contain only the requested variant.

When the full variant set is large, a representative set MAY be returned based on buyer context or other criteria. This ensures agents always have product context for display while getting exactly what they requested.

**Inputs**

| Name | Type   | Required | Description                                            |
| ---- | ------ | -------- | ------------------------------------------------------ |
| id   | string | **Yes**  | Global ID (GID) of product or variant.Defined in path. |

**Output**

| Name     | Type                                                          | Required | Description                                                                                                                                                                       |
| -------- | ------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ucp      | [Ucp Response](/specification/shopping/catalog/#ucp-response) | **Yes**  |                                                                                                                                                                                   |
| product  | [Product](/specification/shopping/catalog/#product)           | No       | The product containing the requested ID. For product ID lookups, variants may contain a representative set. For variant ID lookups, variants contains only the requested variant. |
| messages | Array\[[Message](/specification/shopping/catalog/#message)\]  | No       | Errors, warnings, or informational messages about the requested item.                                                                                                             |

## Entities

### Context

Location and market context for catalog operations. All fields are optional. Platforms MAY geo-detect context from request IP/headers. When context fields are provided, they MUST override any auto-detected values.

| Name        | Type   | Required | Description                                                                                                                                           |
| ----------- | ------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| country     | string | No       | ISO 3166-1 alpha-2 country code (e.g., 'US', 'CA'). Market context for product availability, pricing, and currency. Detected from request if omitted. |
| region      | string | No       | State, province, emirate, or district (e.g., 'CA', 'ON', 'Dubai'). Format varies by country.                                                          |
| postal_code | string | No       | Postal or ZIP code for regional refinement. Not applicable in all countries.                                                                          |
| intent      | string | No       | Background context for semantic search (e.g., 'looking for gift under $50', 'need something durable for outdoor use').                                |

### Product

A catalog entry representing a sellable item with one or more purchasable variants.

`media` and `variants` are ordered arrays. Businesses SHOULD return the featured image and default variant as the first element. Platforms SHOULD treat the first element as the featured item for display.

| Name        | Type                                                                       | Required | Description                                                                                        |
| ----------- | -------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------- |
| id          | string                                                                     | **Yes**  | Global ID (GID) uniquely identifying this product.                                                 |
| handle      | string                                                                     | No       | URL-safe product handle/slug.                                                                      |
| title       | string                                                                     | **Yes**  | Product title.                                                                                     |
| description | object                                                                     | **Yes**  | Product description in one or more formats. At least one format must be provided.                  |
| url         | string                                                                     | No       | Canonical product page URL.                                                                        |
| category    | string                                                                     | No       | Category: taxonomy path (e.g., 'Apparel > Shirts') or merchant-defined type (e.g., 'Premium Tee'). |
| price       | [Price Range](/specification/shopping/catalog/#price-range)                | **Yes**  | Price range across all variants.                                                                   |
| list_price  | [Price Range](/specification/shopping/catalog/#price-range)                | No       | List price range before discounts (for strikethrough display).                                     |
| media       | Array\[[Media](/specification/shopping/catalog/#media)\]                   | No       | Product media (images, videos, 3D models). First item is the featured media for listings.          |
| options     | Array\[[Product Option](/specification/shopping/catalog/#product-option)\] | No       | Product options (Size, Color, etc.).                                                               |
| variants    | Array\[[Variant](/specification/shopping/catalog/#variant)\]               | **Yes**  | Purchasable variants of this product. First item is the featured variant for listings.             |
| rating      | [Rating](/specification/shopping/catalog/#rating)                          | No       | Aggregate product rating.                                                                          |
| tags        | Array[string]                                                              | No       | Product tags for categorization and search.                                                        |
| metadata    | object                                                                     | No       | Business-defined custom data extending the standard product model.                                 |

### Variant

A purchasable SKU with specific option selections, price, and availability.

`media` is an ordered array. Businesses SHOULD return the featured variant image as the first element. Platforms SHOULD treat the first element as featured.

| Name             | Type                                                                         | Required | Description                                                                                        |
| ---------------- | ---------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------- |
| id               | string                                                                       | **Yes**  | Global ID (GID) uniquely identifying this variant. Used as item.id in checkout.                    |
| sku              | string                                                                       | No       | Business-assigned identifier for inventory and fulfillment.                                        |
| barcode          | string                                                                       | No       | Industry-standard identifier (UPC, EAN, ISBN) for the variant.                                     |
| handle           | string                                                                       | No       | URL-safe variant handle/slug.                                                                      |
| title            | string                                                                       | **Yes**  | Variant display title (e.g., 'Blue / Large').                                                      |
| description      | object                                                                       | **Yes**  | Variant description in one or more formats. At least one format must be provided.                  |
| url              | string                                                                       | No       | Canonical variant page URL.                                                                        |
| category         | string                                                                       | No       | Category: taxonomy path (e.g., 'Apparel > Shirts') or merchant-defined type (e.g., 'Premium Tee'). |
| price            | [Price](/specification/shopping/catalog/#price)                              | **Yes**  | Current selling price.                                                                             |
| list_price       | [Price](/specification/shopping/catalog/#price)                              | No       | List price before discounts (for strikethrough display).                                           |
| availability     | object                                                                       | No       | Variant availability for purchase.                                                                 |
| selected_options | Array\[[Selected Option](/specification/shopping/catalog/#selected-option)\] | No       | Option selections that define this variant.                                                        |
| media            | Array\[[Media](/specification/shopping/catalog/#media)\]                     | No       | Variant media (images, videos, 3D models). First item is the featured media for listings.          |
| rating           | [Rating](/specification/shopping/catalog/#rating)                            | No       | Variant rating.                                                                                    |
| tags             | Array[string]                                                                | No       | Variant tags for categorization and search.                                                        |
| metadata         | object                                                                       | No       | Business-defined custom data extending the standard variant model.                                 |
| seller           | object                                                                       | No       | Optional seller context for this variant.                                                          |

### Price

| Name     | Type    | Required | Description                                                                     |
| -------- | ------- | -------- | ------------------------------------------------------------------------------- |
| amount   | integer | **Yes**  | Amount in minor currency units (e.g., 1000 = $10.00 USD). Use 0 for free items. |
| currency | string  | **Yes**  | ISO 4217 currency code (e.g., 'USD', 'EUR', 'GBP').                             |

### Price Range

| Name | Type                                            | Required | Description                 |
| ---- | ----------------------------------------------- | -------- | --------------------------- |
| min  | [Price](/specification/shopping/catalog/#price) | **Yes**  | Minimum price in the range. |
| max  | [Price](/specification/shopping/catalog/#price) | **Yes**  | Maximum price in the range. |

### Media

| Name     | Type    | Required | Description                                                      |
| -------- | ------- | -------- | ---------------------------------------------------------------- |
| type     | string  | **Yes**  | Media type discriminator. **Enum:** `image`, `video`, `model_3d` |
| url      | string  | **Yes**  | URL to the media resource.                                       |
| alt_text | string  | No       | Accessibility text describing the media.                         |
| width    | integer | No       | Width in pixels (for images/video).                              |
| height   | integer | No       | Height in pixels (for images/video).                             |

### Product Option

| Name   | Type                                                                   | Required | Description                          |
| ------ | ---------------------------------------------------------------------- | -------- | ------------------------------------ |
| name   | string                                                                 | **Yes**  | Option name (e.g., 'Size', 'Color'). |
| values | Array\[[Option Value](/specification/shopping/catalog/#option-value)\] | **Yes**  | Available values for this option.    |

### Option Value

| Name  | Type   | Required | Description                                                 |
| ----- | ------ | -------- | ----------------------------------------------------------- |
| label | string | **Yes**  | Display text for this option value (e.g., 'Small', 'Blue'). |

### Selected Option

| Name  | Type   | Required | Description                            |
| ----- | ------ | -------- | -------------------------------------- |
| name  | string | **Yes**  | Option name (e.g., 'Size').            |
| label | string | **Yes**  | Selected option label (e.g., 'Large'). |

### Rating

| Name      | Type    | Required | Description                                             |
| --------- | ------- | -------- | ------------------------------------------------------- |
| value     | number  | **Yes**  | Average rating value.                                   |
| scale_max | number  | **Yes**  | Maximum value on the rating scale (e.g., 5 for 5-star). |
| count     | integer | No       | Number of reviews contributing to the rating.           |

### Search Filters

Filter criteria for narrowing search results. Standard filters are defined below; merchants MAY support additional custom filters via `additionalProperties`.

| Name     | Type                                                          | Required | Description                                                                                                                                                                                                                                                 |
| -------- | ------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| category | string                                                        | No       | Filter by product category. Categories are merchant-defined strings representing product taxonomy. Valid values can be discovered from the category field in search results, merchant documentation, or standard taxonomies that businesses may align with. |
| price    | [Price Filter](/specification/shopping/catalog/#price-filter) | No       |                                                                                                                                                                                                                                                             |

### Price Filter

| Name | Type    | Required | Description                   |
| ---- | ------- | -------- | ----------------------------- |
| min  | integer | No       | Minimum price in minor units. |
| max  | integer | No       | Maximum price in minor units. |

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

All catalog responses include an optional `messages` array that allows businesses to provide context about errors, warnings, or informational notices.

### Message Types

Messages communicate business outcomes and provide context:

| Type      | When to Use                             | Example Codes                                         |
| --------- | --------------------------------------- | ----------------------------------------------------- |
| `error`   | Business-level errors                   | `NOT_FOUND`, `OUT_OF_STOCK`, `REGION_RESTRICTED`      |
| `warning` | Important conditions affecting purchase | `DELAYED_FULFILLMENT`, `FINAL_SALE`, `AGE_RESTRICTED` |
| `info`    | Additional context without issues       | `PROMOTIONAL_PRICING`, `LIMITED_AVAILABILITY`         |

**Note**: All catalog errors use `severity: "recoverable"` - agents handle them programmatically (retry, inform user, show alternatives).

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
  "products": []
}
```

This is not an error—the query was valid but returned no results.

**Backorder Warning**

When a product is available but has delayed fulfillment, return the product with a warning message. Use the `path` field to target specific variants.

```json
{
  "ucp": {...},
  "product": {
    "id": "prod_xyz789",
    "title": "Professional Chef Knife Set",
    "variants": [
      {
        "id": "var_abc",
        "title": "12-piece Set",
        "description": { "plain": "Complete professional knife collection." },
        "price": { "amount": 29900, "currency": "USD" },
        "availability": { "available": true }
      }
    ]
  },
  "messages": [
    {
      "type": "warning",
      "code": "DELAYED_FULFILLMENT",
      "path": "$.product.variants[0]",
      "content": "12-piece set on backorder, ships in 2-3 weeks"
    }
  ]
}
```

Agents can present the option and inform the user about the delay. The `path` field uses RFC 9535 JSONPath to target specific components.

**Product Not Found**

When a requested product/variant ID doesn't exist, return success with an error message and omit the `product` field.

```json
{
  "ucp": {...},
  "messages": [
    {
      "type": "error",
      "code": "NOT_FOUND",
      "content": "The requested product ID does not exist",
      "severity": "recoverable"
    }
  ]
}
```

Agents should handle this gracefully (e.g., ask user for a different product).

## Transport Bindings

The abstract operations above are bound to specific transport protocols as defined below:

- [REST Binding](https://ucp.dev/specification/shopping/catalog-rest/index.md): RESTful API mapping.
- [MCP Binding](https://ucp.dev/specification/shopping/catalog-mcp/index.md): Model Context Protocol mapping via JSONRPC.
