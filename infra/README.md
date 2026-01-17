# Infra Quickstart

This is the minimal, current infra workflow. The source of truth for Shovel
integrations is `packages/config/src/infra/shovel-integrations.ts`, which feeds
the TypeScript generator in `packages/config/src/infra/shovel-config.ts`.

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

This runs ABI builds (ERC-8004), contract typegen, Shovel config generation,
and JSON validation.

Or run the full infra validation pipeline:

```
make infra-check
```

The Shovel config generator lives in `packages/config` under the infra namespace
(`src/infra/shovel-config.ts`), uses `@indexsupply/shovel-config`, and validates
env via `@ucp/config/env`. Contract addresses are resolved from the generated
`@ucp/contracts` package.

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
payments escrow, generates the Shovel config, and starts Shovel. ABI/typegen
is not run in `infra-up`; use `make infra-check` or `make generate-contracts`
if you need to refresh generated types/addresses.

## Logs
```
make anvil-logs
make shovel-logs
```

## Register an agent

```
make register-agent
```

## Add a new Shovel integration

Add a new entry in `packages/config/src/infra/shovel-integrations.ts` using
`defineEventIntegration`. Example:

```ts
defineEventIntegration({
  contractName: "ReputationRegistry",
  shovelName: "erc8004_reputation_response_appended",
  tableName: "erc8004_reputation_response_events",
  addressColumn: "registry",
  eventName: "ResponseAppended",
  inputs: {
    agentId: { column: "agent_id", type: "numeric" },
    clientAddress: { column: "client_address", type: "bytea" },
    feedbackIndex: { column: "feedback_index", type: "numeric" },
    responder: { column: "responder", type: "bytea" },
    responseURI: { column: "response_uri", type: "text" },
  },
})
```

Then regenerate the config:

```
make shovel-config
```

## Deploy registries only

Deploy each registry contract to the local Anvil chain. Use `deploy-registries`
to run all three.

```
make deploy-identity
make deploy-reputation
make deploy-validation
make deploy-registries
```

## Seed reputation + validation

Write sample data to the Reputation and Validation registries on Anvil.
Use `seed-erc8004` to run all three seeds (agent + reputation + validation).

```
make seed-reputation
make seed-validation
make seed-erc8004
```

## Register an agent (seed identity)

```
make register-agent
```

## Tear down

```
make infra-down
```

## Clean generated artifacts

```
make infra-clean
```
