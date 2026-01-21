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

# Menu Capability - MCP Binding

This document specifies the Model Context Protocol (MCP) binding for the
[Menu Capability](menu.md).

## Protocol Fundamentals

### Discovery

Businesses advertise MCP transport availability through their UCP profile at
`/.well-known/ucp`.

```json
{
  "ucp": {
    "version": "2026-01-11",
    "services": {
      "xyz.localprotocol.restaurant": {
        "version": "2026-01-11",
        "spec": "https://localprotocol.xyz/specification/overview",
        "mcp": {
          "schema": "https://localprotocol.xyz/services/restaurant/mcp.openrpc.json",
          "endpoint": "https://business.example.com/ucp/mcp"
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

### Platform Profile Advertisement

MCP clients **MUST** include the UCP platform profile URI with every request.
The platform profile is included in the `_meta.ucp` structure within the request
parameters:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "search_menu",
  "params": {
    "_meta": {
      "ucp": {
        "profile": "https://platform.example/profiles/v2026-01/restaurant-agent.json"
      }
    },
    "query": "family meal",
    "context": {
      "country": "US",
      "intent": "delivery dinner"
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
| `search_menu` | [Search Menu](menu.md#search-menu) | Search for menu items. |
| `list_menu_items` | [List Menu Items](menu.md#list-menu-items) | List menu categories and items. |
| `get_menu_item` | [Get Menu Item](menu.md#get-menu-item) | Get a menu item by ID. |
| `get_item_modifier_groups` | [Get Item Modifier Groups](menu.md#get-item-modifier-groups) | Get modifier groups for an item. |
| `get_modifier_item` | [Get Modifier Item](menu.md#get-modifier-item) | Get a modifier item by ID. |
| `get_merchant_menus` | [Get Merchant Menus](menu.md#get-merchant-menus) | Get menus for a merchant. |

### `search_menu`

Maps to the [Search Menu](menu.md#search-menu) operation.

{{ method_fields('search_menu', 'restaurant/rest.openapi.json', 'restaurant/menu-mcp') }}

### `list_menu_items`

Maps to the [List Menu Items](menu.md#list-menu-items) operation.

{{ method_fields('list_menu_items', 'restaurant/rest.openapi.json', 'restaurant/menu-mcp') }}

### `get_menu_item`

Maps to the [Get Menu Item](menu.md#get-menu-item) operation.

{{ method_fields('get_menu_item', 'restaurant/rest.openapi.json', 'restaurant/menu-mcp') }}

### `get_item_modifier_groups`

Maps to the [Get Item Modifier Groups](menu.md#get-item-modifier-groups) operation.

{{ method_fields('get_item_modifier_groups', 'restaurant/rest.openapi.json', 'restaurant/menu-mcp') }}

### `get_modifier_item`

Maps to the [Get Modifier Item](menu.md#get-modifier-item) operation.

{{ method_fields('get_modifier_item', 'restaurant/rest.openapi.json', 'restaurant/menu-mcp') }}

### `get_merchant_menus`

Maps to the [Get Merchant Menus](menu.md#get-merchant-menus) operation.

{{ method_fields('get_merchant_menus', 'restaurant/rest.openapi.json', 'restaurant/menu-mcp') }}
