# Prayagraj first-launch scope and integration gates

**Launch scope:** AdVibe is focused exclusively on Prayagraj, Uttar Pradesh, India. This is a launch constraint, not an assertion that any screen is physically live, licensed or bookable today.

## UI and market behavior

- The marketing homepage, locations page, pricing planner, contact page, advertiser and driver pages now state Prayagraj as the first launch city.
- The public locations explorer reads published records from GET /api/v1/public/locations?citySlug=prayagraj through the same-origin frontend relay. It no longer publishes fictional screen counts or nationwide demo cities. Backend or inventory outages produce explicit error/empty states.
- The pricing planner is **illustrative only** and cannot change cities. It does not issue orders or present imaginary screen availability.
- The contact page uses the existing authenticated-proxy path for the public enquiry API when Cloudflare Turnstile is configured. Set frontend `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and backend `ENQUIRY_TURNSTILE_SECRET` / `ENQUIRY_TURNSTILE_HOSTNAME`. Without a verified widget it explicitly opens an email draft instead of pretending that it sent the form.
- The driver onboarding UI fixes the working city to Prayagraj. Actual driver eligibility is determined by the backend and legal checks.
- In the production backend, the public city/zone/location catalogs are filtered to Prayagraj. Admin catalog data is retained for internal management and test fixtures still exercise other locations in non-production environments.
- Do not describe the three neighbourhood examples in the homepage diagram as operational coverage. Only approved and published backend inventory is available for planning.

## Integrations already represented in code but NOT verified live

| Integration | Existing implementation | Production dependency |
| --- | --- | --- |
| Next.js to Express API | Same-origin /api/backend relay; fail-closed proxy | Configure ADVIBE_BACKEND_ORIGIN, production HTTPS, CORS_ORIGINS, session cookies; verify deployed API health |
| PostgreSQL / Prisma | Schema, migrations, transactional data model | Managed DB, migrations, backups, restore drill, durable secrets |
| Resend email | Auth email adapter | Verified sending domain, correct AUTH_EMAIL_FROM and recovery/verification delivery test |
| Cashfree collection | Backend payment orders and signed webhook verification | Approved merchant, sandbox E2E and webhook verification, refund and reconciliation controls, separate production approval |
| Driver payouts | Reviewed ledger, settlement workflows and provider abstraction | Approved payout provider, recipient verification and finance/tax signoffs |
| Creative/media pipeline | Upload intent, private storage adapters, processing worker contracts | Private S3-compatible storage, scanning worker and processing worker deployed |
| Driver verification | Private KYC evidence and Admin review | Approved document policy, secure object storage and verification vendor/process |
| Vehicle/device playback | Pairing/manifest and telemetry backend code | Real devices, key provisioning, driver consent, operations and hardware safety review |
| Support | Authenticated tickets and notification jobs | Deployed dispatch workers and chosen email/SMS/push channels |

**Do not enable** live payments, payouts, document collection, or device playback merely because a button or API route exists. Provider credentials must remain server-side. Never put secret API keys into NEXT_PUBLIC variables.

## Practical release sequence

1. Establish the Prayagraj catalog with reviewed zones and physically verified screens, starting with no invented availability.
2. Configure the backend origin, PostgreSQL and verified Resend sender; test account registration, email verification, login and MFA in staging.
3. Configure object storage and media scan/processing; upload a genuine creative and verify private storage access controls.
4. Complete advertiser booking and Cashfree sandbox E2E including failed/expired holds, replayed webhooks, refunds and reconciliation.
5. Complete partner agreement, KYC, verified screen installation and evidence flow, then the payout-provider and finance checks.
6. Run CI, multi-browser and device QA, security tests and live staging acceptance. Only after legal and operator signoffs should payment/device production flags be enabled.

This document describes the code changes and outstanding dependencies. It is not a declaration of deployment or launch readiness.
