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

# Delivery Fulfillment Extension

* **Capability Name:** `xyz.localprotocol.delivery.fulfillment`
* **Version:** `DRAFT`

## Overview

The Delivery Fulfillment Extension adds delivery metadata to restaurant checkout
fulfillment. It allows a platform to attach a delivery quote identifier or a
full delivery request to `checkout.fulfillment` without replacing the base
restaurant checkout schema.

The extension supports:

* `quote_id` when a merchant-provided delivery quote already exists.
* `delivery_request` when the platform supplies delivery details for checkout.

## Extension Schema

{{ extension_schema_fields('delivery/fulfillment.json#/$defs/checkout', 'delivery/fulfillment') }}

## Relationship to Checkout

The delivery fulfillment extension composes onto the restaurant checkout schema.
Platforms negotiate `xyz.localprotocol.delivery.fulfillment` alongside
`xyz.localprotocol.restaurant.checkout` to enable delivery-aware checkout flows.
