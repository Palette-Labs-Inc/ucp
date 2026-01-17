# Identity Indexer

Reads ERC-8004 registrations from Shovel tables (Postgres + Kysely), resolves each
`agentURI` (from the registry ABI), fetches the referenced UCP discovery profile (`/.well-known/ucp`),
and serves results from an in-memory cache.

## Prerequisites

- Shovel is running and writing to Postgres.
- The Shovel config generator includes the ERC-8004 `Registered` event with
  `agentURI` stored as `agent_uri`.
- `SHOVEL_PG_URL` is set in your environment (see `.env.template`).

## Development

```bash
pnpm -C apps/identity-indexer install
pnpm -C apps/identity-indexer dev
```

## Type generation (optional)

Generate Kysely types from the live Shovel database:

```bash
pnpm -C apps/identity-indexer generate:db-types
```

## API

- `GET /health`
- `GET /businesses?limit=50`
- `GET /businesses/:domain`

## Notes

- The indexer polls the Shovel table `erc8004_identity_events` (decoded via ABI) and keeps an
  in-memory cache of resolved agents (recomputed on restart).
- The poller persists its cursor to `identity-indexer.cursor.json` in the
  working directory for fast resume.
- If `agentURI` is unreachable or invalid, the record is skipped and retried on
  the next poll.
