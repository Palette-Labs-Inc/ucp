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
artifacts under the `deploy.broadcast_path` in `infra/shovel/contracts.json`.
For ERC-8004, the deploy scripts also write small JSON address files in
`contracts/erc8004/broadcast/*.json`, which are used as fallbacks when
`run-latest.json` is absent.

All Shovel contract indexing share the same `SHOVEL_START_BLOCK`.

```
pnpm install
```

## Indexer DB types (optional)

If you're using the identity indexer, generate Kysely types from Postgres:

```
make indexer-db-types
```

## Bring up infra

```
make infra-up
```

This boots Postgres + Anvil, deploys all ERC-8004 registries, deploys the
payments escrow, generates the Shovel config, and starts Shovel.

## Logs
```
make anvil-logs
make shovel-logs
```

## Register an agent

```
make register-agent
```

## Deploy registries only

```
make deploy-identity
make deploy-reputation
make deploy-validation
make deploy-registries
```

## Seed reputation + validation

```
make seed-reputation
make seed-validation
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
