# Menu Capability - REST Binding

This document specifies the HTTP/REST binding for the [Menu Capability](https://ucp.dev/specification/commerce/menu/index.md).

## Protocol Fundamentals

### Discovery

Businesses advertise REST transport availability through their UCP profile at `/.well-known/ucp`.

```json
{
  "ucp": {
    "version": "2026-01-11",
    "services": {
      "xyz.localprotocol.commerce": {
        "version": "2026-01-11",
        "spec": "https://localprotocol.xyz/specification/overview",
        "rest": {
          "schema": "https://localprotocol.xyz/services/commerce/rest.openapi.json",
          "endpoint": "https://business.example.com/ucp"
        }
      }
    },
    "capabilities": [
      {
        "name": "xyz.localprotocol.commerce.menu",
        "version": "2026-01-11",
        "spec": "https://localprotocol.xyz/specification/commerce/menu",
        "schema": "https://localprotocol.xyz/schemas/commerce/menu.json"
      }
    ]
  }
}
```

## Endpoints

| Endpoint                           | Method | Operation                                                                                         | Description                      |
| ---------------------------------- | ------ | ------------------------------------------------------------------------------------------------- | -------------------------------- |
| `/menu/search`                     | POST   | [Search Menu](https://ucp.dev/specification/commerce/menu/#search-menu)                           | Search for menu items.           |
| `/menu/items`                      | GET    | [List Menu Items](https://ucp.dev/specification/commerce/menu/#list-menu-items)                   | List menu categories and items.  |
| `/menu/items/{id}`                 | GET    | [Get Menu Item](https://ucp.dev/specification/commerce/menu/#get-menu-item)                       | Get a menu item by ID.           |
| `/menu/items/{id}/modifier-groups` | GET    | [Get Item Modifier Groups](https://ucp.dev/specification/commerce/menu/#get-item-modifier-groups) | Get modifier groups for an item. |
| `/menu/modifiers/{id}`             | GET    | [Get Modifier Item](https://ucp.dev/specification/commerce/menu/#get-modifier-item)               | Get a modifier item by ID.       |
| `/merchants/{id}/menus`            | GET    | [Get Merchant Menus](https://ucp.dev/specification/commerce/menu/#get-merchant-menus)             | Get menus for a merchant.        |

### `POST /menu/search`

Maps to the [Search Menu](https://ucp.dev/specification/commerce/menu/#search-menu) operation.

**Error:** Operation ID `search_menu` not found.

### `GET /menu/items`

Maps to the [List Menu Items](https://ucp.dev/specification/commerce/menu/#list-menu-items) operation.

**Error:** Operation ID `list_menu_items` not found.

### `GET /menu/items/{id}`

Maps to the [Get Menu Item](https://ucp.dev/specification/commerce/menu/#get-menu-item) operation.

**Error:** Operation ID `get_menu_item` not found.

### `GET /menu/items/{id}/modifier-groups`

Maps to the [Get Item Modifier Groups](https://ucp.dev/specification/commerce/menu/#get-item-modifier-groups) operation.

**Error:** Operation ID `get_item_modifier_groups` not found.

### `GET /menu/modifiers/{id}`

Maps to the [Get Modifier Item](https://ucp.dev/specification/commerce/menu/#get-modifier-item) operation.

**Error:** Operation ID `get_modifier_item` not found.

### `GET /merchants/{id}/menus`

Maps to the [Get Merchant Menus](https://ucp.dev/specification/commerce/menu/#get-merchant-menus) operation.

**Error:** Operation ID `get_merchant_menus` not found.
