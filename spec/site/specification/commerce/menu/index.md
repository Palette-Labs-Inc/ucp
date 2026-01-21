# Menu Capability

- **Capability Name:** `xyz.localprotocol.commerce.menu`
- **Version:** `DRAFT`

## Overview

Allows platforms to browse restaurant menus and configurable items. The Menu capability supports category-based browsing, item retrieval by ID, and nested modifier groups for customization.

**Key Concepts**

- **Menu**: A collection of categories tied to a merchant and fulfillment modes.
- **Category**: A grouping of items for display.
- **Item**: A base menu item with price, media, and modifier groups.
- **Modifier Group**: A set of selectable modifier options with selection rules.
- **Modifier Option**: A selectable entry that references a modifier item and can trigger nested groups.
- **Modifier Item**: The purchasable add-on with its own pricing and metadata.
- **Modifier Selection**: The buyer's chosen modifiers and quantities.

## Modifier Selection Flow

Menu items do not resolve to a single variant. Instead, a buyer selects one or more modifier options (including nested options) to form a selection set that is attached to the base item.

**Example (donut box with nested glaze choice)**

```json
{
  "item": {
    "id": "donut-dozen",
    "modifier_groups": [
      {
        "id": "flavors",
        "name": "Choose up to 12 flavors",
        "minimum_selections": 0,
        "maximum_selections": 12,
        "max_per_modifier": 6,
        "modifier_options": [
          {
            "item_id": "chocolate",
            "selection_quantity_default": 2,
            "child_modifier_groups": [
              {
                "id": "glaze",
                "name": "Glaze",
                "minimum_selections": 1,
                "maximum_selections": 1,
                "modifier_options": [
                  { "item_id": "light_glaze" },
                  { "item_id": "extra_glaze" }
                ]
              }
            ]
          },
          { "item_id": "strawberry" }
        ]
      }
    ]
  },
  "modifier_selections": [
    { "modifier_group_id": "flavors", "modifier_item_id": "chocolate", "quantity": 2 },
    { "modifier_group_id": "glaze", "modifier_item_id": "extra_glaze", "quantity": 1 },
    { "modifier_group_id": "flavors", "modifier_item_id": "strawberry", "quantity": 3 }
  ]
}
```

In this model:

- **Modifier item** is the purchasable add-on (e.g., `chocolate`).
- **Modifier option** is the selection wrapper that references the item and can attach nested groups (e.g., `glaze`).
- **Modifier selection** captures what the buyer chose and quantities.

## Operations

The Menu capability defines the following logical operations.

| Operation                    | Description                                         |
| ---------------------------- | --------------------------------------------------- |
| **Search Menu**              | Search for menu items with query and context.       |
| **List Menu Items**          | Retrieve a menu's categories and items by merchant. |
| **Get Menu Item**            | Retrieve a specific menu item by ID.                |
| **Get Item Modifier Groups** | Fetch modifier groups for a menu item.              |
| **Get Modifier Item**        | Fetch a modifier item by ID.                        |
| **Get Merchant Menus**       | Retrieve menus and categories for a merchant.       |

### Search Menu

Searches a merchant's menu using query text and context. Supports pagination.

**Inputs**

| Name       | Type                                                                   | Required | Description             |
| ---------- | ---------------------------------------------------------------------- | -------- | ----------------------- |
| query      | string                                                                 | **Yes**  | Free-text search query. |
| context    | [Context](/specification/commerce/menu/#context)                       | No       |                         |
| pagination | [Pagination Request](/specification/commerce/menu/#pagination-request) | No       |                         |

**Output**

| Name       | Type                                                                     | Required | Description                                                           |
| ---------- | ------------------------------------------------------------------------ | -------- | --------------------------------------------------------------------- |
| ucp        | [Ucp Response](/specification/commerce/menu/#ucp-response)               | **Yes**  |                                                                       |
| categories | Array\[ [Category](/specification/commerce/menu/#category)\]             | **Yes**  | Menu categories with nested items.                                    |
| pagination | [Pagination Response](/specification/commerce/menu/#pagination-response) | No       |                                                                       |
| messages   | Array\[[Message](/specification/commerce/menu/#message)\]                | No       | Errors, warnings, or informational messages about the search results. |

### List Menu Items

Retrieves menu categories and nested items for a merchant context.

*No inputs defined.*

**Output**

| Name       | Type                                                         | Required | Description                                                 |
| ---------- | ------------------------------------------------------------ | -------- | ----------------------------------------------------------- |
| ucp        | [Ucp Response](/specification/commerce/menu/#ucp-response)   | **Yes**  |                                                             |
| categories | Array\[ [Category](/specification/commerce/menu/#category)\] | **Yes**  | Menu categories with nested items.                          |
| messages   | Array\[[Message](/specification/commerce/menu/#message)\]    | No       | Errors, warnings, or informational messages about the menu. |

### Get Menu Item

Retrieves a specific menu item by its Global ID (GID).

**Inputs**

| Name | Type   | Required | Description                                   |
| ---- | ------ | -------- | --------------------------------------------- |
| id   | string | **Yes**  | Global ID (GID) of menu item.Defined in path. |

**Output**

| Name     | Type                                                       | Required | Description                                                           |
| -------- | ---------------------------------------------------------- | -------- | --------------------------------------------------------------------- |
| ucp      | [Ucp Response](/specification/commerce/menu/#ucp-response) | **Yes**  |                                                                       |
| item     | [Item](/specification/commerce/menu/#item)                 | **Yes**  | The requested menu item.                                              |
| messages | Array\[[Message](/specification/commerce/menu/#message)\]  | No       | Errors, warnings, or informational messages about the requested item. |

### Get Item Modifier Groups

Fetches modifier groups for a menu item to enable item customization flows.

**Inputs**

| Name | Type   | Required | Description                                   |
| ---- | ------ | -------- | --------------------------------------------- |
| id   | string | **Yes**  | Global ID (GID) of menu item.Defined in path. |

**Output**

| Name            | Type                                                                    | Required | Description                                                           |
| --------------- | ----------------------------------------------------------------------- | -------- | --------------------------------------------------------------------- |
| ucp             | [Ucp Response](/specification/commerce/menu/#ucp-response)              | **Yes**  |                                                                       |
| modifier_groups | Array\[[Modifier Group](/specification/commerce/menu/#modifier-group)\] | **Yes**  | Modifier groups available for the item.                               |
| messages        | Array\[[Message](/specification/commerce/menu/#message)\]               | No       | Errors, warnings, or informational messages about the requested item. |

### Get Modifier Item

Retrieves a modifier item by its Global ID (GID).

**Inputs**

| Name | Type   | Required | Description                                       |
| ---- | ------ | -------- | ------------------------------------------------- |
| id   | string | **Yes**  | Global ID (GID) of modifier item.Defined in path. |

**Output**

| Name          | Type                                                         | Required | Description                                                               |
| ------------- | ------------------------------------------------------------ | -------- | ------------------------------------------------------------------------- |
| ucp           | [Ucp Response](/specification/commerce/menu/#ucp-response)   | **Yes**  |                                                                           |
| modifier_item | [Modifier Item](/specification/commerce/menu/#modifier-item) | **Yes**  | The requested modifier item.                                              |
| messages      | Array\[[Message](/specification/commerce/menu/#message)\]    | No       | Errors, warnings, or informational messages about the requested modifier. |

### Get Merchant Menus

Retrieves menus and categories for a merchant by ID.

**Inputs**

| Name | Type   | Required | Description                                  |
| ---- | ------ | -------- | -------------------------------------------- |
| id   | string | **Yes**  | Global ID (GID) of merchant.Defined in path. |

**Output**

| Name       | Type                                                         | Required | Description                                                 |
| ---------- | ------------------------------------------------------------ | -------- | ----------------------------------------------------------- |
| ucp        | [Ucp Response](/specification/commerce/menu/#ucp-response)   | **Yes**  |                                                             |
| categories | Array\[ [Category](/specification/commerce/menu/#category)\] | **Yes**  | Menu categories with nested items.                          |
| messages   | Array\[[Message](/specification/commerce/menu/#message)\]    | No       | Errors, warnings, or informational messages about the menu. |

## Entities

### Context

Location and market context for menu operations. All fields are optional. Platforms MAY geo-detect context from request IP/headers. When context fields are provided, they MUST override any auto-detected values.

| Name        | Type   | Required | Description                                                                                                                                           |
| ----------- | ------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| country     | string | No       | ISO 3166-1 alpha-2 country code (e.g., 'US', 'CA'). Market context for product availability, pricing, and currency. Detected from request if omitted. |
| region      | string | No       | State, province, emirate, or district (e.g., 'CA', 'ON', 'Dubai'). Format varies by country.                                                          |
| postal_code | string | No       | Postal or ZIP code for regional refinement. Not applicable in all countries.                                                                          |
| intent      | string | No       | Background context for semantic search (e.g., 'quick lunch nearby', 'family meal under $30').                                                         |

### Menu

| Name               | Type                                                                                    | Required | Description                                          |
| ------------------ | --------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------- |
| id                 | string                                                                                  | **Yes**  | Menu identifier.                                     |
| name               | string                                                                                  | **Yes**  | Menu name.                                           |
| category_ids       | Array[string]                                                                           | **Yes**  | Category identifiers included in this menu.          |
| fulfillment_modes  | Array[string]                                                                           | No       | Fulfillment modes supported by this menu.            |
| description        | string                                                                                  | No       | Menu description.                                    |
| hours              | object                                                                                  | No       | Menu availability hours.                             |
| additional_charges | Array\[[Menu Additional Charge](/specification/commerce/menu/#menu-additional-charge)\] | No       | Additional charges applied to orders from this menu. |

### Category

| Name        | Type                                                | Required | Description                       |
| ----------- | --------------------------------------------------- | -------- | --------------------------------- |
| id          | string                                              | **Yes**  | Category identifier.              |
| name        | string                                              | **Yes**  | Category display name.            |
| description | string                                              | No       | Optional category description.    |
| items       | Array\[[Item](/specification/commerce/menu/#item)\] | **Yes**  | Items contained in this category. |

### Item

| Name            | Type                                                                    | Required | Description                                                                         |
| --------------- | ----------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------- |
| id              | string                                                                  | **Yes**  | Menu item identifier.                                                               |
| name            | string                                                                  | **Yes**  | Menu item name.                                                                     |
| description     | object                                                                  | **Yes**  | Menu item description in one or more formats. At least one format must be provided. |
| price           | [Price](/specification/commerce/menu/#price)                            | **Yes**  | Base price for the menu item.                                                       |
| media           | Array\[[Media](/specification/commerce/menu/#media)\]                   | No       | Menu item media (images, videos, 3D models).                                        |
| modifier_groups | Array\[[Modifier Group](/specification/commerce/menu/#modifier-group)\] | No       | Modifier groups available for this item.                                            |
| metadata        | object                                                                  | No       | Business-defined custom data extending the menu item model.                         |

### Modifier Group

| Name               | Type                                                                      | Required | Description                                                                                                                                               |
| ------------------ | ------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| id                 | string                                                                    | **Yes**  | Modifier group identifier.                                                                                                                                |
| name               | string                                                                    | **Yes**  | Display name for the modifier group.                                                                                                                      |
| minimum_selections | integer                                                                   | No       | Minimum number of selections required from this group.                                                                                                    |
| maximum_selections | integer                                                                   | No       | Maximum number of selections allowed from this group.                                                                                                     |
| max_per_modifier   | integer                                                                   | No       | Maximum quantity allowed per modifier option. Defaults to 1 (each modifier can be selected at most once). Set value > 1 to allow per-modifier quantities. |
| modifier_options   | Array\[[Modifier Option](/specification/commerce/menu/#modifier-option)\] | **Yes**  | Available modifier options within this group.                                                                                                             |
| type               | string                                                                    | No       | Modifier group type classification.                                                                                                                       |

### Modifier Option

| Name                  | Type                                                                    | Required | Description                                                  |
| --------------------- | ----------------------------------------------------------------------- | -------- | ------------------------------------------------------------ |
| item_id               | string                                                                  | **Yes**  | Modifier item identifier for this option.                    |
| child_modifier_groups | Array\[[Modifier Group](/specification/commerce/menu/#modifier-group)\] | No       | Nested modifier groups required after selecting this option. |

### Modifier Item

| Name     | Type                                         | Required | Description                                                     |
| -------- | -------------------------------------------- | -------- | --------------------------------------------------------------- |
| id       | string                                       | **Yes**  | Modifier item identifier.                                       |
| title    | string                                       | **Yes**  | Modifier item title.                                            |
| price    | [Price](/specification/commerce/menu/#price) | **Yes**  | Price for this modifier item.                                   |
| metadata | object                                       | No       | Business-defined custom data extending the modifier item model. |

### Modifier Selection

| Name              | Type                                                                                      | Required | Description                                   |
| ----------------- | ----------------------------------------------------------------------------------------- | -------- | --------------------------------------------- |
| modifier_group_id | string                                                                                    | **Yes**  | Modifier group identifier for this selection. |
| selections        | Array\[[Modifier Item Selection](/specification/commerce/menu/#modifier-item-selection)\] | **Yes**  | Selections made within the modifier group.    |

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
