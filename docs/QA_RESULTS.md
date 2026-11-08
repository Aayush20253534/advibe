# Current quality assurance results

Handoff updated: 8 November 2026. Test artifacts retain their recorded execution timestamps. Machine-readable evidence: [`qa/verification.json`](qa/verification.json), [`qa/ci-verification.json`](qa/ci-verification.json), [`qa/restore-drill.json`](qa/restore-drill.json), [`qa/build-size.json`](qa/build-size.json), [`qa/lighthouse-summary.json`](qa/lighthouse-summary.json). Local, synthetic CI, lab performance and unavailable provider/staging evidence are distinguished below.

| Verification | Actual result |
| --- | --- |
| Frontend `npm run check` | Lint, TypeScript, all 154 unit/runtime/legacy assertions, current route contract and production build pass |
| Backend `db:validate`, fresh `db:migrate:deploy`, complete `check` | Pass: lint, types, 222 tests including subtests, zero failures/skips, build and HTTP smoke |
| Migration reapply | Pass: no pending migrations, history unchanged |
| Lockfile install compatibility | `npm ci --dry-run` accepts both manifests/lockfiles; generation also passed after dependency remediation |
| `npm audit` | Frontend 0 / backend 0 known advisories after scoped fixes |
| Source secret check | 915 tracked files scanned at security checkpoint; no high-confidence private-key/provider-key patterns; not full-history assurance |
| Encrypted PostgreSQL restore | Pass on synthetic full-suite database: 70 tables, 80 users, 20 migration records and 143 audit records match; nonempty restore rejected |
| Browser/visual/axe checks | Chromium, Firefox and WebKit CI pass: role/auth flows, 18 portal-shell scenarios per engine, responsive public pages; 45 screenshots and 45 axe reports with no reported violations |
| Lighthouse | Three mobile samples each for home/login, environment and unmet goals recorded in the performance report; not field Core Web Vitals |
| Remote release-evidence validation | Pass with release approvals still false/null; validates rejection behavior, not permission to launch |
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

Use a supported Node 22.19+ runtime (CI 22.23.4). Install root and backend using `npm ci`. Run root `npm run check`. For database verification, create a dedicated disposable PostgreSQL 16 database, set `NODE_ENV=test`, `DB_TEST_ALLOWED=true`, synthetic auth/MFA keys and matching `DATABASE_URL` / `DIRECT_URL`, then execute the backend commands above. Never point these suites at customer databases. The existing CI service setup contains a concrete synthetic configuration.

`npm run test:all` discovers every frontend `.test.mjs` and `.test.tsx` file through a cross-platform Node runner. `test:client` selects runtime regressions. CI runs the full frontend suite rather than only a subset of historical contracts.

For browser execution on an approved test environment, use `BASE_URL` and `PLAYWRIGHT_BROWSER=chromium|firefox|webkit` with `test:live-browser`, `test:auth-browser`, `test:portal-shell` and `test:public-browser`. These intercept synthetic contract data; they are frontend E2E checks, not real provider E2E. Public checks cover 390, 768 and 1440 px, keyboard menu dismissal, unavailable coverage, uncaught errors, axe serious/critical violations and screenshots. The visual-baseline script remains available; old image baselines must be reviewed on the same rendering platform, not automatically accepted.

## Browser and performance evidence

The complete seven-job Actions runs on `fe0bac7` and `f4d973e` passed; exact later results are recorded in `qa/ci-verification.json`. Each browser artifact contains nine public captures (home, locations, login at 390/768/1440 px) and six portal gate/home captures, with axe JSON beside each image. The [visual review](BROWSER_VISUAL_QA.md) records the screenshots actually inspected, resolved contrast/image-capture defects and remaining scope. The evidence archive contains synthetic names and records only.

Lighthouse 13.6.0 runs in Chromium against the already-running local production build, with fresh browser storage and default simulated mobile throttling. Three samples per page are saved as HTML/JSON plus their median summary. Measurement errors fail CI; scores below release-review goals remain visible in the summary. A successful job does not imply every numerical performance goal passed. INP is not measured by this navigation-only run.

The local managed preview adapter still passes unsupported Vite flags to Next. CI provided independent browser execution; no alternate local browser workaround or application-script disguise was used. Manual screen-reader, 200% zoom, representative device/network, hosted cookie/TLS and real provider checks remain outstanding.

## Recovery measurement limits

Local encrypted backup: 188 ms; restore: 1,347 ms; archive: 334,516 bytes, mode 0600. These tiny synthetic timings are not production RTO/RPO commitments. The temporary encryption identity and archive were removed after verification. Actual customer recovery requires separately controlled keys, retained backups and an isolated staging restore drill.
