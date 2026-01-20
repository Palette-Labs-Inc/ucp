# UCP Schema Contribution Guidelines (AI-Focused)

These rules define the required conventions for authoring UCP JSON Schemas in
this repository. They are derived from the UCP specification and documentation
and are intended for AI agents and contributors.

## Scope
- Applies to all JSON Schemas under `spec/source/**`
- Applies to capability, component, type, and meta schemas
- Applies to schema composition and transport bindings

## Source of Truth
- Author schemas in `spec/source/**`
- Generated artifacts live in `spec/spec/**`
- Never edit generated outputs directly

## Schema Categories
Use the correct category and required metadata:

### Capability Schemas
Schemas that define negotiated capabilities and appear in
`ucp.capabilities[]`.

Required fields:
- `$schema` (JSON Schema draft/2020-12)
- `$id` (canonical schema URI)
- `title`
- `description`
- `name` (reverse-domain capability identifier)
- `version` (YYYY-MM-DD)

### Component Schemas
Schemas embedded within capabilities but not negotiated.

Required fields:
- `$schema`, `$id`, `title`, `description`

Must not include:
- `name`, `version`

### Type Schemas
Reusable schema fragments referenced by capabilities/components.

Required fields:
- `$schema`, `$id`, `title`, `description`

Must not include:
- `name`, `version`

### Meta Schemas
Schemas that define protocol structure (e.g., capability declarations).

Required fields:
- `$schema`, `$id`, `title`, `description`

Must not include:
- `name`, `version`

## Naming and Governance
- Capability names MUST use reverse-domain notation:
  `{reverse-domain}.{service}.{capability}`
- The origin of `spec` and `schema` URLs MUST match the namespace authority:
  - `dev.ucp.*` → `https://ucp.dev/...`
  - `com.vendor.*` → `https://vendor.com/...`
- `$id` MUST be a valid URI and should align with published schema hosting.
- Use date-based versions: `YYYY-MM-DD`.

## Versioning and Compatibility
- Breaking changes REQUIRE a new version.
- Backwards-compatible changes MAY be introduced without a new version.
- Capabilities can version independently from the protocol.
- Extensions must follow the same compatibility rules as their parent capability.

## Schema Composition and Extensions
- Extensions MUST use `allOf` to compose onto the base schema.
- Extensions MUST be self-describing and declare new types in `$defs`.
- Composed type names MUST use the pattern:
  `{capability-name}.{TypeName}`
- Platforms MUST resolve composed schemas client-side by fetching the base
  schema and all negotiated extensions.

## Transport Binding Rules
- OpenAPI/OpenRPC definitions MUST reference base schemas only.
- Transport definitions MUST NOT define payload shapes inline.
- Endpoints are resolved by appending OpenAPI paths to the declared `endpoint`.

## Request/Response Annotations
UCP uses custom annotations to define request/response behavior:

- `ucp_request`:
  - `"omit"` means response-only
  - `"required"` or `"optional"` for request inclusion
  - `"create"` / `"update"` scoped requirements
- `ucp_response`:
  - `"omit"` means request-only
- `ucp_shared_request: true` marks types reused by both sides

Use these annotations consistently and only when necessary to express request/
response differences without duplicating schema structures.

## Data and Formatting Rules
- Date/time values MUST use RFC 3339 (e.g., `format: "date-time"`).
- Currency amounts are minor units (e.g., cents).
- Currency codes MUST be ISO 4217 (3-letter uppercase).
- Country codes SHOULD be ISO 3166-1 alpha-2 where applicable.
- JSONPath references should follow RFC 9535.
- Use `const` for discriminators and `enum` for closed sets.

## Security and Privacy
- Platforms MUST NOT send raw card credentials except where explicitly allowed
  (e.g., `card_credential` for tokenization flows).
- Tokenized credentials MUST be opaque to platforms.
- Do not echo credentials in responses.
- Always require HTTPS for sensitive data flows.

## Authoring Workflow
1. Edit schemas in `spec/source/**`.
2. Run `spec/generate_schemas.py` to build `spec/spec/**`.
3. Run language generators as needed:
   - `packages/python-sdk/generate_models.sh`
   - `packages/js-sdk/generate_models.sh`
   - `spec/generate_ts_schema_types.js`

## AI Do/Don’t Rules
Do:
- Follow schema category requirements and required metadata.
- Use `allOf` for extensions; never inline extension fields into base schemas.
- Preserve authoritative namespace/origin alignment.
- Keep responses backward-compatible unless bumping version.

Don’t:
- Change existing field semantics without a version bump.
- Add inline payload definitions to transport specs.
- Remove required fields or make optional fields required without a new version.
- Introduce new capability names outside the namespace authority.
