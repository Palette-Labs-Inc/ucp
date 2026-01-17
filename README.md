# UCP Monorepo

This repository is the monorepo for the Universal Commerce Protocol (UCP).

## Strategy
We vendor upstream repositories as **git subtrees** so they stay intact and can
be synced from upstream. The UCP spec is first-class
at `spec/`, and orchestration happens from the root using `make` + shell scripts.

## Layout

- `spec` — UCP specs, schemas, and documentation tooling.
- `packages/js-sdk` — upstream JavaScript SDK (subtree).
  - https://github.com/Universal-Commerce-Protocol/js-sdk
- `packages/python-sdk` — upstream Python SDK (subtree).
  - https://github.com/Universal-Commerce-Protocol/python-sdk
- `packages/conformance` — upstream conformance tests (subtree).
  - https://github.com/Universal-Commerce-Protocol/conformance
- `apps/samples` — upstream samples (subtree).
  - https://github.com/Universal-Commerce-Protocol/samples
- `apps` — runnable services you own.
- `packages` — shared libraries you own.

## Workspace

This repo uses `pnpm` workspaces for `apps/*` and `packages/*`.

## Getting Started

Requirements pulled from the upstream subtree READMEs:

- Node.js + npm (JS SDK build + model generation).
- pnpm (monorepo orchestration).
- uv 0.9+ (Python SDK, samples, and conformance).
- Python 3.10+ (conformance + Python samples).
- ruff (used by Python SDK generation/formatting via `uv`).

One-time setup:

```
pnpm install
```

If you plan to run Python tooling, install uv:

```
curl -LsSf https://astral.sh/uv/install.sh | sh
```

Common flows:

- Generate spec → conformance → SDKs:
  - `make spec-conformance-sdks`
- Update subtrees from upstream:
  - `make update-upstream`
- Run the Python sample server:
  - `make run-samples-server`
- Run conformance tests against the sample server:
  - `make test-conformance`

## Contracts

This repo vendors the ERC-8004 reference implementation as a git subtree at
`contracts/erc8004`. The subtree includes a Foundry submodule (`forge-std`),
which must be initialized after cloning:

```
git submodule update --init --recursive contracts/erc8004/lib/forge-std
```

Start a local Anvil node via Docker:

```
make anvil
```

### Infra env (Anvil + Shovel)

Copy the repo root template and edit as needed:

```
cp .env.template .env
```

This `.env` is used by `make` targets (deploy/seed/shovel-config) and
`infra/shovel/contracts.json` (the Shovel config source of truth).

Foreground mode and logs:

```
make anvil-fg
make anvil-logs
```

For the streamlined infra flow (Anvil + Shovel + ABI), see `infra/README.md`.

Run ERC-8004 tests or deploy to Anvil:

```
make test-erc8004
make deploy-erc8004
make register-agent
```

Install dependencies with:

```
pnpm install
```

Run the TypeScript schema generator in `spec`:

```
pnpm run generate:ts
```

## Upstream sync (subtrees)

Pull latest upstream changes into each subtree:

```
make update-upstream
```

If you need to run a single subtree pull manually:

```
git subtree pull --prefix packages/js-sdk https://github.com/Universal-Commerce-Protocol/js-sdk main --squash
```

## Orchestration

Orchestration is handled by `Makefile` + scripts in `scripts/`. These wrappers
run upstream tooling in-place (npm/uv) and pass the local `spec/` path when
generating SDK models so we do not fork upstream build conventions.

Why this order (`spec` → `Python SDK` → `conformance` → `JS SDK`):
1) Spec generation is the source of truth, so we refresh schema types first.
2) Python SDK generation runs next because the sample server imports `ucp_sdk`
   models at startup.
3) Conformance validates the spec against the sample server once models are
   available.
4) JS SDK generation runs last to produce artifacts after conformance passes.

Notes:
- Conformance tests use `absltest` and are executed per `*_test.py` file.

Run the orchestrated targets from the repo root:

```
make help
make generate
make spec-conformance-sdks
make build-js-sdk
make build-python-sdk
make run-samples-server
make test-conformance
make test
```

Key scripts:

- `scripts/update_upstream.sh` — runs subtree pulls for all upstream repos.
- `scripts/js_sdk_build.sh` — installs and builds JS SDK using `spec/`.
- `scripts/python_sdk_build.sh` — installs and builds Python SDK.
- `scripts/run_samples_server.sh` — runs the Python sample server.
- `scripts/run_conformance.sh` — sets up test DBs and runs conformance tests.
- `scripts/spec_conformance_sdks.sh` — spec types → conformance → SDKs.