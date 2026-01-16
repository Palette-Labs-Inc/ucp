# UCP Monorepo

This repository is the monorepo for the Universal Commerce Protocol (UCP).

## Layout

- `spec` — UCP specs, schemas, and documentation tooling.
- `apps` — runnable services you own.
- `packages` — shared libraries you own.

## SDKs and conformance

- `packages/js-sdk` — JavaScript SDK (placeholder).
- `packages/python-sdk` — Python SDK (placeholder).
- `packages/conformance` — conformance tests (placeholder).
- `apps/samples` — samples and reference implementations (placeholder).

## Workspace

This repo uses `pnpm` workspaces for `apps/*` and `packages/*`.

Install dependencies with:

```
pnpm install
```

Run the TypeScript schema generator in `spec`:

```
pnpm run generate:ts
```
