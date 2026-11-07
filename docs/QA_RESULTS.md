# Current quality assurance results

Date: 7 November 2026. Machine-readable evidence: [`qa/verification.json`](qa/verification.json), [`qa/restore-drill.json`](qa/restore-drill.json), [`qa/build-size.json`](qa/build-size.json). The final report distinguishes local results from unavailable staging/browser checks.

| Verification | Actual result |
| --- | --- |
| Frontend `npm run check` | Lint, TypeScript, all 154 unit/runtime/legacy assertions, current route contract and production build pass |
| Backend `db:validate`, fresh `db:migrate:deploy`, complete `check` | Pass: lint, types, 222 tests including subtests, zero failures/skips, build and HTTP smoke |
| Migration reapply | Pass: no pending migrations, history unchanged |
| Lockfile install compatibility | `npm ci --dry-run` accepts both manifests/lockfiles; generation also passed after dependency remediation |
| `npm audit` | Frontend 0 / backend 0 known advisories after scoped fixes |
| Source secret check | 915 tracked files scanned at security checkpoint; no high-confidence private-key/provider-key patterns; not full-history assurance |
| Encrypted PostgreSQL restore | Pass on synthetic full-suite database: 70 tables, 80 users, 20 migration records and 143 audit records match; nonempty restore rejected |
| Browser/visual/axe checks | Not executed locally: managed preview startup blocked. CI scripts configured for Chromium, Firefox, WebKit; no remote green result implied. |
| Lighthouse/Core Web Vitals | Not measured; build byte counts are not performance scores |
| Actual provider sandbox | Not executed; injected adapters/mock mail do not verify external providers |
| Live staging/deployment/alerts | Not verified; account access, credentials and approvals required |

## Regression coverage added

- API paths and response envelopes, network failures, pagination metadata, mutation CSRF/idempotency and caller cancellation.
- Final cursor page still offers enabled First page; loading disables both controls.
- Official map origin, safe query encoding, invalid/unconfigured coordinates.
- Stream size limits, multibyte boundaries, stalled-reader abort, cookie isolation and real relay handler responses.
- Canonical origin validation, disabled indexing, invalid configuration, sitemap scope and private/legal exclusions.
- Backend public-format next cursor, and support queue fixture selection across earlier suites while retaining lease/concurrency/retry/dead-letter assertions.

Legacy tests remain. Two stale source assertions were reconciled with current blue CTA contrast and whitespace-independent focus restoration. No protection was disabled to obtain a green result.

## Reproduce local checks

Use a supported Node 22+ runtime. Install root and backend using `npm ci`. Run root `npm run check`. For database verification, create a dedicated disposable PostgreSQL 16 database, set `NODE_ENV=test`, `DB_TEST_ALLOWED=true`, synthetic auth/MFA keys and matching `DATABASE_URL` / `DIRECT_URL`, then execute the backend commands above. Never point these suites at customer databases. The existing CI service setup contains a concrete synthetic configuration.

`npm run test:all` discovers every frontend `.test.mjs` and `.test.tsx` file through a cross-platform Node runner. `test:client` selects runtime regressions. CI runs the full frontend suite rather than only a subset of historical contracts.

For browser execution on an approved test environment, use `BASE_URL` and `PLAYWRIGHT_BROWSER=chromium|firefox|webkit` with `test:live-browser`, `test:auth-browser`, `test:portal-shell` and `test:public-browser`. These intercept synthetic contract data; they are frontend E2E checks, not real provider E2E. Public checks cover 390, 768 and 1440 px, keyboard menu dismissal, unavailable coverage, uncaught errors, axe serious/critical violations and screenshots. The visual-baseline script remains available; old image baselines must be reviewed on the same rendering platform, not automatically accepted.

## Browser evidence gap

No screenshots are included because no browser rendered this branch in the available managed preview. Its launcher passes Vite flags to `next dev`. Repair the launcher or execute the committed CI/staging checks and inspect the artifacts before claiming visual acceptance. The CI matrix is configuration awaiting execution, not evidence of cross-browser success.

## Recovery measurement limits

Local encrypted backup: 188 ms; restore: 1,347 ms; archive: 334,516 bytes, mode 0600. These tiny synthetic timings are not production RTO/RPO commitments. The temporary encryption identity and archive were removed after verification. Actual customer recovery requires separately controlled keys, retained backups and an isolated staging restore drill.
