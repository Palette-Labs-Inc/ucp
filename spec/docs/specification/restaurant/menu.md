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

# Menu Capability

* **Capability Name:** `xyz.localprotocol.restaurant.menu`
* **Version:** `DRAFT`

## Overview

Allows platforms to browse restaurant menus and configurable items. The Menu
capability supports category-based browsing, item retrieval by ID, and
nested modifier groups for customization.

**Key Concepts**

* **Menu**: A collection of categories tied to a merchant and fulfillment modes.
* **Category**: A grouping of items for display.
* **Item**: A base menu item with price, media, and modifier groups.
* **Modifier Group**: A set of selectable modifier options with selection rules.
* **Modifier Option**: A selectable entry that references a modifier item and can
  trigger nested groups.
* **Modifier Item**: The purchasable add-on with its own pricing and metadata.
* **Modifier Selection**: The buyer's chosen modifiers and quantities.

## Modifier Selection Flow

Menu items do not resolve to a single variant. Instead, a buyer selects one or
more modifier options (including nested options) to form a selection set that is
attached to the base item.

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
- **Modifier option** is the selection wrapper that references the item and can
  attach nested groups (e.g., `glaze`).
- **Modifier selection** captures what the buyer chose and quantities.

## Operations

The Menu capability defines the following logical operations.

| Operation | Description |
| :--- | :--- |
| **Search Menu** | Search for menu items with query and context. |
| **List Menu Items** | Retrieve a menu's categories and items by merchant. |
| **Get Menu Item** | Retrieve a specific menu item by ID. |
| **Get Item Modifier Groups** | Fetch modifier groups for a menu item. |
| **Get Modifier Item** | Fetch a modifier item by ID. |
| **Get Merchant Menus** | Retrieve menus and categories for a merchant. |

### Search Menu

Searches a merchant's menu using query text and context. Supports pagination.

{{ method_fields('search_menu', 'restaurant/rest.openapi.json', 'restaurant/menu') }}

### List Menu Items

Retrieves menu categories and nested items for a merchant context.

{{ method_fields('list_menu_items', 'restaurant/rest.openapi.json', 'restaurant/menu') }}

### Get Menu Item

Retrieves a specific menu item by its Global ID (GID).

{{ method_fields('get_menu_item', 'restaurant/rest.openapi.json', 'restaurant/menu') }}

### Get Item Modifier Groups

Fetches modifier groups for a menu item to enable item customization flows.

{{ method_fields('get_item_modifier_groups', 'restaurant/rest.openapi.json', 'restaurant/menu') }}

### Get Modifier Item

Retrieves a modifier item by its Global ID (GID).

{{ method_fields('get_modifier_item', 'restaurant/rest.openapi.json', 'restaurant/menu') }}

### Get Merchant Menus

Retrieves menus and categories for a merchant by ID.

{{ method_fields('get_merchant_menus', 'restaurant/rest.openapi.json', 'restaurant/menu') }}

## Entities

### Context

Location and market context for menu operations. All fields are optional.
Platforms MAY geo-detect context from request IP/headers. When context fields
are provided, they MUST override any auto-detected values.

{{ extension_schema_fields('restaurant/menu.json#/$defs/context', 'restaurant/menu') }}

### Menu

{{ schema_fields('restaurant/types/menu', 'restaurant/menu') }}

### Category

{{ schema_fields('restaurant/types/category', 'restaurant/menu') }}

### Item

{{ schema_fields('restaurant/types/item', 'restaurant/menu') }}

### Modifier Group

{{ schema_fields('restaurant/types/modifier_group', 'restaurant/menu') }}

### Modifier Option

{{ schema_fields('restaurant/types/modifier_option', 'restaurant/menu') }}

### Modifier Item

{{ schema_fields('restaurant/types/modifier_item', 'restaurant/menu') }}

### Modifier Selection

{{ schema_fields('restaurant/types/modifier_selection', 'restaurant/menu') }}

### Pagination

Cursor-based pagination for list operations.

#### Pagination Request

{{ extension_schema_fields('shopping/types/pagination.json#/$defs/request', 'restaurant/menu') }}

#### Pagination Response

{{ extension_schema_fields('shopping/types/pagination.json#/$defs/response', 'restaurant/menu') }}
