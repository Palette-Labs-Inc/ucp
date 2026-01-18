# Identity Indexer

Reads ERC-8004 registrations from Shovel tables (Postgres + Kysely), resolves
each `agentURI` (from the registry ABI), fetches the referenced UCP discovery
profile (`/.well-known/ucp`), and serves results from an in-memory cache.

## Requirements

- Node + pnpm
- Docker (Postgres + Shovel)
- Anvil running (see repo root `README.md`)

## Getting started

```bash
pnpm install
cp .env.local.example .env.local
pnpm run dev
```

See `ENV.md` for the repo-wide env strategy and naming conventions. Runtime
values come from root `.env` + app `.env.local`, and types are generated from
root `.env.template` + app `.env.local.example`.

## Commands

```bash
pnpm run dev
pnpm run build
pnpm run start
pnpm run env:generate
pnpm run shovel:config
pnpm run generate:db-types
pnpm run register-agent
pnpm run verify-agent
```

## Shovel

Shovel is started by the indexer process and runs via Docker Compose with the
app-level config in `shovel/docker-compose.yml`.

### Postgres env

Postgres settings live in `.env.local` and are used by the indexer and Shovel
containers.

### Add a new Shovel integration

Add a new entry in `src/shovel-integrations.ts` using `defineEventIntegration`.
Example:

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

Then regenerate the config (or restart the indexer to auto-generate):

```bash
pnpm run shovel:config
```

## API

- `GET /health`
- `GET /businesses?limit=50`
- `GET /businesses/:domain`

## Notes

- The indexer polls the Shovel table `erc8004_identity_events` (decoded via ABI)
  and keeps an in-memory cache of resolved agents (recomputed on restart).
- The poller persists its cursor to `identity-indexer.cursor.json` in the
  working directory for fast resume.
- If `agentURI` is unreachable or invalid, the record is skipped and retried on
  the next poll.
