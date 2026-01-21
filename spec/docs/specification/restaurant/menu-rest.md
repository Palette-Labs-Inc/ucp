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

# Menu Capability - REST Binding

This document specifies the HTTP/REST binding for the
[Menu Capability](menu.md).

## Protocol Fundamentals

### Discovery

Businesses advertise REST transport availability through their UCP profile at
`/.well-known/ucp`.

```json
{
  "ucp": {
    "version": "2026-01-11",
    "services": {
      "xyz.localprotocol.restaurant": {
        "version": "2026-01-11",
        "spec": "https://localprotocol.xyz/specification/overview",
        "rest": {
          "schema": "https://localprotocol.xyz/services/restaurant/rest.openapi.json",
          "endpoint": "https://business.example.com/ucp"
        }
      }
    },
    "capabilities": [
      {
        "name": "xyz.localprotocol.restaurant.menu",
        "version": "2026-01-11",
        "spec": "https://localprotocol.xyz/specification/restaurant/menu",
        "schema": "https://localprotocol.xyz/schemas/restaurant/menu.json"
      }
    ]
  }
}
```

## Endpoints

| Endpoint | Method | Operation | Description |
| :--- | :--- | :--- | :--- |
| `/menu/search` | POST | [Search Menu](menu.md#search-menu) | Search for menu items. |
| `/menu/items` | GET | [List Menu Items](menu.md#list-menu-items) | List menu categories and items. |
| `/menu/items/{id}` | GET | [Get Menu Item](menu.md#get-menu-item) | Get a menu item by ID. |
| `/menu/items/{id}/modifier-groups` | GET | [Get Item Modifier Groups](menu.md#get-item-modifier-groups) | Get modifier groups for an item. |
| `/menu/modifiers/{id}` | GET | [Get Modifier Item](menu.md#get-modifier-item) | Get a modifier item by ID. |
| `/merchants/{id}/menus` | GET | [Get Merchant Menus](menu.md#get-merchant-menus) | Get menus for a merchant. |

### `POST /menu/search`

Maps to the [Search Menu](menu.md#search-menu) operation.

{{ method_fields('search_menu', 'rest.openapi.json', 'menu-rest') }}

### `GET /menu/items`

Maps to the [List Menu Items](menu.md#list-menu-items) operation.

{{ method_fields('list_menu_items', 'rest.openapi.json', 'menu-rest') }}

### `GET /menu/items/{id}`

Maps to the [Get Menu Item](menu.md#get-menu-item) operation.

{{ method_fields('get_menu_item', 'rest.openapi.json', 'menu-rest') }}

### `GET /menu/items/{id}/modifier-groups`

Maps to the [Get Item Modifier Groups](menu.md#get-item-modifier-groups) operation.

{{ method_fields('get_item_modifier_groups', 'rest.openapi.json', 'menu-rest') }}

### `GET /menu/modifiers/{id}`

Maps to the [Get Modifier Item](menu.md#get-modifier-item) operation.

{{ method_fields('get_modifier_item', 'rest.openapi.json', 'menu-rest') }}

### `GET /merchants/{id}/menus`

Maps to the [Get Merchant Menus](menu.md#get-merchant-menus) operation.

{{ method_fields('get_merchant_menus', 'rest.openapi.json', 'menu-rest') }}
