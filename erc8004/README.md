# ERC-8004 Agent URI Spec

This directory defines the ERC-8004 agent registration file schema and related
documentation. It is intentionally separate from the UCP spec to avoid mixing
protocol standards.

## Layout
- `source/schemas/agent-uri.schema.json` — canonical JSON Schema source
- `spec/schemas/agent-uri.schema.json` — published schema (mirrors `source/`)
- `generate_ts_schema_types.js` — type generator (mirrors UCP spec tooling)
- `generated/schema-types.ts` — generated TypeScript types
- `scripts/generate_models.sh` — Zod type generator (quicktype)
- `generated/agent-uri.zod.ts` — generated Zod schema + types

## Agent URI Registration File
Per ERC-8004, `agentURI` must resolve to a registration JSON document. The
schema here standardizes that document so indexers and clients can reliably
validate it.

## Usage
Use the schema to validate `agentURI` JSON at ingestion time (indexers) and
generation time (seed scripts, registries, and test fixtures).

Generate TypeScript types:
```
pnpm -C erc8004 install
pnpm -C erc8004 run generate:ts
```

Generate Zod types:
```
pnpm -C erc8004 run generate:zod
```

## Notes
- This is not part of the UCP spec; it is an integration dependency.
- Keep fields aligned with ERC-8004 and add extensions sparingly.
