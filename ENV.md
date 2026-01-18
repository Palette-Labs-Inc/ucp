## Env Strategy Specification

### Goals
- Single source of truth for infra defaults at repo root.
- App-specific local overrides.
- Clear, consistent file naming.

### File Naming Standard
- **Root**: `.env.template` (committed; infra defaults)
- **Apps**: `.env.local.example` (committed; local override template)
- **Local values**: `.env` and `.env.local` (never committed)

### Loading Order
Apps should load environment variables in this order:
1. Root `.env` (if present)
2. App `.env.local`

Later files override earlier ones.

### App Root Resolution
Apps should resolve the app root via the repo root and an explicit app path.
Use `appRootFromCwd({ appPath: "apps/<app-name>" })` so app-scoped `.env.local`
is loaded regardless of the current working directory.

### App Contract (App `.env.local.example`)
Apps depend on app-scoped values, typically:
- `DATABASE_URL`