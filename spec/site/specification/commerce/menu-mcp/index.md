# Menu Capability - MCP Binding

This document specifies the Model Context Protocol (MCP) binding for the [Menu Capability](https://ucp.dev/specification/commerce/menu/index.md).

## Protocol Fundamentals

### Discovery

Businesses advertise MCP transport availability through their UCP profile at `/.well-known/ucp`.

```json
{
  "ucp": {
    "version": "2026-01-11",
    "services": {
      "xyz.localprotocol.commerce": {
        "version": "2026-01-11",
        "spec": "https://localprotocol.xyz/specification/overview",
        "mcp": {
          "schema": "https://localprotocol.xyz/services/commerce/mcp.openrpc.json",
          "endpoint": "https://business.example.com/ucp/mcp"
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

### Platform Profile Advertisement

MCP clients **MUST** include the UCP platform profile URI with every request. The platform profile is included in the `_meta.ucp` structure within the request parameters:

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

The `_meta.ucp.profile` field **MUST** be present in every MCP tool invocation to enable version compatibility checking and capability negotiation.

## Tools

UCP Capabilities map 1:1 to MCP Tools.

| Tool                       | Operation                                                                                         | Description                      |
| -------------------------- | ------------------------------------------------------------------------------------------------- | -------------------------------- |
| `search_menu`              | [Search Menu](https://ucp.dev/specification/commerce/menu/#search-menu)                           | Search for menu items.           |
| `list_menu_items`          | [List Menu Items](https://ucp.dev/specification/commerce/menu/#list-menu-items)                   | List menu categories and items.  |
| `get_menu_item`            | [Get Menu Item](https://ucp.dev/specification/commerce/menu/#get-menu-item)                       | Get a menu item by ID.           |
| `get_item_modifier_groups` | [Get Item Modifier Groups](https://ucp.dev/specification/commerce/menu/#get-item-modifier-groups) | Get modifier groups for an item. |
| `get_modifier_item`        | [Get Modifier Item](https://ucp.dev/specification/commerce/menu/#get-modifier-item)               | Get a modifier item by ID.       |
| `get_merchant_menus`       | [Get Merchant Menus](https://ucp.dev/specification/commerce/menu/#get-merchant-menus)             | Get menus for a merchant.        |

### `search_menu`

Maps to the [Search Menu](https://ucp.dev/specification/commerce/menu/#search-menu) operation.

**Inputs**

| Name       | Type                                                                       | Required | Description             |
| ---------- | -------------------------------------------------------------------------- | -------- | ----------------------- |
| query      | string                                                                     | **Yes**  | Free-text search query. |
| context    | [Context](/specification/commerce/menu-mcp/#context)                       | No       |                         |
| pagination | [Pagination Request](/specification/commerce/menu-mcp/#pagination-request) | No       |                         |

**Output**

| Name       | Type                                                                         | Required | Description                                                           |
| ---------- | ---------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------- |
| ucp        | [Ucp Response](/specification/commerce/menu-mcp/#ucp-response)               | **Yes**  |                                                                       |
| categories | Array\[ [Category](/specification/commerce/menu-mcp/#category)\]             | **Yes**  | Menu categories with nested items.                                    |
| pagination | [Pagination Response](/specification/commerce/menu-mcp/#pagination-response) | No       |                                                                       |
| messages   | Array\[[Message](/specification/commerce/menu-mcp/#message)\]                | No       | Errors, warnings, or informational messages about the search results. |

### `list_menu_items`

Maps to the [List Menu Items](https://ucp.dev/specification/commerce/menu/#list-menu-items) operation.

*No inputs defined.*

**Output**

| Name       | Type                                                             | Required | Description                                                 |
| ---------- | ---------------------------------------------------------------- | -------- | ----------------------------------------------------------- |
| ucp        | [Ucp Response](/specification/commerce/menu-mcp/#ucp-response)   | **Yes**  |                                                             |
| categories | Array\[ [Category](/specification/commerce/menu-mcp/#category)\] | **Yes**  | Menu categories with nested items.                          |
| messages   | Array\[[Message](/specification/commerce/menu-mcp/#message)\]    | No       | Errors, warnings, or informational messages about the menu. |

### `get_menu_item`

Maps to the [Get Menu Item](https://ucp.dev/specification/commerce/menu/#get-menu-item) operation.

**Inputs**

| Name | Type   | Required | Description                                   |
| ---- | ------ | -------- | --------------------------------------------- |
| id   | string | **Yes**  | Global ID (GID) of menu item.Defined in path. |

**Output**

| Name     | Type                                                           | Required | Description                                                           |
| -------- | -------------------------------------------------------------- | -------- | --------------------------------------------------------------------- |
| ucp      | [Ucp Response](/specification/commerce/menu-mcp/#ucp-response) | **Yes**  |                                                                       |
| item     | [Item](/specification/commerce/menu-mcp/#item)                 | **Yes**  | The requested menu item.                                              |
| messages | Array\[[Message](/specification/commerce/menu-mcp/#message)\]  | No       | Errors, warnings, or informational messages about the requested item. |

### `get_item_modifier_groups`

Maps to the [Get Item Modifier Groups](https://ucp.dev/specification/commerce/menu/#get-item-modifier-groups) operation.

**Inputs**

| Name | Type   | Required | Description                                   |
| ---- | ------ | -------- | --------------------------------------------- |
| id   | string | **Yes**  | Global ID (GID) of menu item.Defined in path. |

**Output**

| Name            | Type                                                                        | Required | Description                                                           |
| --------------- | --------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------- |
| ucp             | [Ucp Response](/specification/commerce/menu-mcp/#ucp-response)              | **Yes**  |                                                                       |
| modifier_groups | Array\[[Modifier Group](/specification/commerce/menu-mcp/#modifier-group)\] | **Yes**  | Modifier groups available for the item.                               |
| messages        | Array\[[Message](/specification/commerce/menu-mcp/#message)\]               | No       | Errors, warnings, or informational messages about the requested item. |

### `get_modifier_item`

Maps to the [Get Modifier Item](https://ucp.dev/specification/commerce/menu/#get-modifier-item) operation.

**Inputs**

| Name | Type   | Required | Description                                       |
| ---- | ------ | -------- | ------------------------------------------------- |
| id   | string | **Yes**  | Global ID (GID) of modifier item.Defined in path. |

**Output**

| Name          | Type                                                             | Required | Description                                                               |
| ------------- | ---------------------------------------------------------------- | -------- | ------------------------------------------------------------------------- |
| ucp           | [Ucp Response](/specification/commerce/menu-mcp/#ucp-response)   | **Yes**  |                                                                           |
| modifier_item | [Modifier Item](/specification/commerce/menu-mcp/#modifier-item) | **Yes**  | The requested modifier item.                                              |
| messages      | Array\[[Message](/specification/commerce/menu-mcp/#message)\]    | No       | Errors, warnings, or informational messages about the requested modifier. |

### `get_merchant_menus`

Maps to the [Get Merchant Menus](https://ucp.dev/specification/commerce/menu/#get-merchant-menus) operation.

**Inputs**

| Name | Type   | Required | Description                                  |
| ---- | ------ | -------- | -------------------------------------------- |
| id   | string | **Yes**  | Global ID (GID) of merchant.Defined in path. |

**Output**

| Name       | Type                                                             | Required | Description                                                 |
| ---------- | ---------------------------------------------------------------- | -------- | ----------------------------------------------------------- |
| ucp        | [Ucp Response](/specification/commerce/menu-mcp/#ucp-response)   | **Yes**  |                                                             |
| categories | Array\[ [Category](/specification/commerce/menu-mcp/#category)\] | **Yes**  | Menu categories with nested items.                          |
| messages   | Array\[[Message](/specification/commerce/menu-mcp/#message)\]    | No       | Errors, warnings, or informational messages about the menu. |
