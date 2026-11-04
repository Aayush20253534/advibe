# 13 — Testing, coverage and CI runbook

## Test levels and claims

| Level | What it demonstrates | What it does not demonstrate |
| --- | --- | --- |
| Static route inventory | Modules/handlers are still declared, duplicate route signatures absent | Live endpoint success |
| HTTP anonymous boundary | Every first-party handler is mounted and rejects invalid anonymous mutations or protected reads | Full authorized success and third-party availability |
| Role matrix | Representative Admin/advertiser/driver reads behave as permitted | Every financial/device edge case |
| Module integration | Real Express + disposable PostgreSQL invariants: state, ownership, permissions, idempotency, concurrency | Live Neon/Resend/sandbox services |
| Frontend contract/browser | Next API relay, role pages and expected user navigation | Actual external providers or production hardware |
| Staging E2E | Actual HTTPS deployed integration and error handling | Legal approval or end-user metrics without further evidence |

## Mandatory execution

```bash
# Only on disposable LOCAL database, e.g. advibe_ci or advibe_test.
export NODE_ENV=test DB_TEST_ALLOWED=true
export DATABASE_URL='postgresql://...@localhost:5432/advibe_ci?schema=public'
export DIRECT_URL='postgresql://...@localhost:5432/advibe_ci?schema=public'
npm install --prefix backend
npm --prefix backend run db:migrate:deploy
npm --prefix backend run test:api-route-inventory
npm --prefix backend run test:api-boundaries
npm --prefix backend run check
npm run test:integration
npm run test:contracts
```

`npm --prefix backend run check` now includes the route inventory and HTTP boundary suite plus every existing B0–B23 module test, lint, TypeScript, build and compiled HTTP smoke. `NODE_ENV=test`, `DB_TEST_ALLOWED=true`, loopback DB host and `_ci`/`_test` database names are required, so test fixtures cannot run against live Neon. Do not remove these guards.

## Cross-module route coverage

`backend/tests/route-inventory.mjs` reads real Express router declarations from `backend/src/modules` plus system routes. Every non-provider route is probed by `api-boundaries.integration.test.mjs` on real Express and disposable PostgreSQL: public GETs must return 200, protected GETs 401 without session, invalid/anonymous writes must reject without 5xx; static suite detects duplicate path-method declarations, missing modules and missing domain test suites. A role matrix tests representative Admin, Driver and all-role views with real signed sessions.

These are **boundary tests**, not fabricated `200` success tests. Authorized state transitions remain covered in domain suites. A new route automatically enters boundary tests; its business happy path should also be added to the relevant module integration suite.

## Domain suite mapping

| Domain | Existing test file |
| --- | --- |
| Auth + security | `auth.integration.test.ts`, `security.integration.test.ts` |
| DB + account | `db.integration.test.ts`, `accounts.integration.test.ts` |
| Driver + KYC | `drivers.integration.test.ts`, `kyc.integration.test.ts` |
| Device + geography | `devices.integration.test.ts`, `geo.integration.test.ts` |
| Media/campaign | `creatives.integration.test.ts`, `campaigns.integration.test.ts` |
| Pricing/holds | `pricing.integration.test.ts`, `reservations.integration.test.ts` |
| Delivery/telemetry | `delivery.integration.test.ts`, `player.integration.test.ts`, `telemetry.integration.test.ts` |
| Finance | `payments.integration.test.ts`, `earnings.integration.test.ts`, `finance.integration.test.ts` |
| Admin/support | `admin.integration.test.ts`, `support.integration.test.ts` |
| Release/ops | `release.test.ts`, frontend `b23-release.test.mjs` |

## Provider exclusions

**No live calls** to Cashfree, private object storage or Google Maps. Existing injected fake adapters may be exercised by old tests for internal accounting/state-machine correctness. New provider-specific HTTP routes are explicitly excluded from cross-module probing; no external charges, uploads or maps requests are made.

## CI acceptance

`.github/workflows/ci.yml` defines backend verification with PostgreSQL 16, frontend checking, browser smoke and recovery drill. The repository had zero recorded GitHub Actions runs when this test initiative started; do not report a passing hosted CI run without a real workflow result. Require the backend-verify job to pass on the submitted commit.

## Release evidence

At staging record request IDs, synthetic test account identifiers, passed/failed results, deployment commit SHA, screenshot-free redacted logs, mail arrival and Admin MFA evidence, database migration status, expiry/concurrency errors, alerting and restore drill. Do not put secrets or identity documents into test artifacts.
