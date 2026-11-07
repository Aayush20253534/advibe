# BlinkMyAd

BlinkMyAd is a vehicle-screen advertising platform for an initial Prayagraj rollout. The repository retains its historical name `advibe` and internal `ADVIBE_*` identifiers.

Next.js 16.4.2 / React 19 frontend, Express 5 / Prisma 6.19 / PostgreSQL backend. Dedicated advertiser, driver and administrator portals use server-authenticated API records through a same-origin relay. No runtime demo account or fictional production record is substituted when the backend is unavailable. Explicit development provider mocks do not replace the real database.

**Launch verdict: Not ready.** Source/build/database checks pass locally; browser acceptance, verified staging, legal/provider/storage/hardware gates and some advanced integrations remain unresolved. Read the [engineering report](docs/ENGINEERING_READINESS_REPORT.md), [current QA evidence](docs/QA_RESULTS.md) and [owner actions](docs/KNOWN_BLOCKERS.md).

## Development

Use Node 22+ and a disposable PostgreSQL 16 database. Configure `backend/.env` and root `.env.local` from their templates. Keep real credentials out of Git; backend CORS/auth origins must match the frontend. Follow [environment setup](docs/DEPLOYMENT_AND_ENVIRONMENT.md).

```bash
npm ci
npm --prefix backend ci
npm --prefix backend run db:migrate:deploy
npm --prefix backend run dev
# In another terminal
npm run dev
```

`ADVIBE_EXTERNAL_MODE=mock` is permitted only in development; production rejects mock providers. See [development provider modes](docs/MOCK_EXTERNAL_PROVIDERS.md). Auth/session/ownership checks always belong to the backend.

## Verification

```bash
npm run check
# Dedicated test database, NODE_ENV=test and DB_TEST_ALLOWED=true required:
npm --prefix backend run check
```

The frontend check runs every unit/runtime/legacy contract test, type/lint checks, current route inventory and production build. Backend checks cover domain/security/database boundaries and HTTP smoke. Browser scripts intercept synthetic API data and are configured for Chromium, Firefox and WebKit in CI; actual provider sandbox and hosted staging acceptance remain separate.

See the [engineering handbook](docs/README.md), [current route inventory](contracts/api-routes.current.json), [security review](docs/SECURITY_REVIEW.md), [cost plan](docs/COST_AND_QUOTA_PLAN.md) and [launch checklist](docs/TESTING_LAUNCH_CHECKLIST.md). The B0 OpenAPI file is historical, not a complete current contract. Existing migrations and business logic are preserved.
