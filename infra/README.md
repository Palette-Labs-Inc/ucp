# Infra Quickstart

This is the minimal, current infra workflow. The source of truth for Shovel
integrations is `infra/shovel/contracts.json`.

## Requirements

- Docker (for Postgres, Anvil, Shovel, Foundry)
- `pnpm` + `uv` if you run SDK or conformance tooling

## One-time setup

```
make env-init
```

You can pin Docker images by setting these in `.env`:

- `FOUNDRY_IMAGE` (Foundry/Anvil/Forge)
- `SHOVEL_IMAGE` (Shovel)

## Validate + generate (recommended)

```
make infra-check
```

This runs ABI build, ABI checks, Shovel config generation, and JSON validation.

Or run the full infra validation pipeline:

```
make infra-check
```

The Shovel config generator lives in `packages/config` under the infra namespace
(`src/infra/shovel-config.ts`), uses `@indexsupply/shovel-config`, and validates
env via `@ucp/config/env`. Contract addresses are resolved from Foundry broadcast
artifacts (the `run-latest.json` under the `deploy.broadcast_path` in
`infra/shovel/contracts.json`), so deploy the contracts first if you’re starting
from a clean checkout.

All Shovel contract indexing share the same `SHOVEL_START_BLOCK`.

```
pnpm install
```

## Bring up infra

```
make infra-up
```

## Logs
```
make anvil-logs
make shovel-logs
```

## Seed an agent (requires IDENTITY_REGISTRY)

```
make seed-erc8004
```

## Tear down

```
make infra-down
```

## Clean generated artifacts

```
make infra-clean
```
