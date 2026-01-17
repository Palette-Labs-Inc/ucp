# Identity Indexer

Indexes ERC-8004 registrations from the Shovel tables via `idxs`, resolves each
`agentURI`, fetches the referenced UCP discovery profile (`/.well-known/ucp`),
and exposes a small HTTP API for domain-based lookups.

## Prerequisites

- Shovel is running and writing to Postgres.
- An Index Supply-compatible API is available for `idxs` to query (local or remote).
- `infra/shovel/contracts.json` includes the ERC-8004 `Registered` event with
  `agentURI` stored as `agent_uri`.
- `SHOVEL_PG_URL` is set in your environment (see `.env.template`).

## Development

```bash
pnpm -C apps/identity-indexer install
pnpm -C apps/identity-indexer dev
```

## API

- `GET /health`
- `GET /businesses?limit=50`
- `GET /businesses/:domain`

## Notes

- The indexer polls the Shovel table `erc8004_identity_events` via `idxs` and
  keeps an in-memory cache for domain lookups.
- If `agentURI` is unreachable or invalid, the record is skipped and retried on
  the next poll.
