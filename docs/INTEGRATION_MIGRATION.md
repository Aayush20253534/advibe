# AdVibe frontend/backend integration roadmap

The target is an authenticated, server-backed platform with no demo mode, fictional business records or browser-local business state. Do not certify a part merely because source files exist. Each part requires relevant automated tests and staging evidence.

1. **Backend-only cutover (source committed):** secure login/signup routes, API-only Admin/Advertiser/Driver layouts, fail-closed proxy and readiness checks, and API-mode CI. The existing generic live portal is a temporary bridge. Production deployment is not ready.
2. **Identity and account UX:** connect and validate all signup, verification, recovery, sessions, Admin MFA, account ownership and session-expiry flows with real staging backend.
3. **Advertiser workflows:** replace generic API tables with dedicated dashboard, campaign editor, creatives/media uploads, formats/locations, booking holds, quotations and analytics. Preserve existing look without local fictional data.
4. **Admin workflows:** campaign/creative approvals, driver applications/KYC moderation, user decisions, screens, zones, pricing rules, reconciliations, audited operations.
5. **Driver workflows:** onboarding, private KYC, vehicles/screens, assigned inventory and delivery schedule, maintenance, reviewed earnings, payout history.
6. **Commerce and finance:** Cashfree sandbox checkout, signed webhooks, payment/booking reconciliation, refund/credit notes, tax-reviewed invoices and provider-confirmed payouts. Live money remains off until approvals.
7. **Physical delivery:** approved device enrollment, signed playlists, secure creative distribution, worker scheduling, consent-based telemetry and accurate reporting.
8. **Infrastructure and staging:** production Neon/managed Postgres, Render deployment, Vercel backend origin, email and MFA, private S3, malware worker, workers, backups, monitoring, true E2E tests.
9. **Purge legacy demo code:** delete old Zustand/demo-auth stores, fictional seeds, browser-local business actions, demo screens, related tests and dependencies after each feature is replaced. Block release if demo fixture imports remain reachable from runtime routes.

Required staging acceptance: real advertiser registers/verifies/logs in, creates campaign with genuine persisted creative/inventory, Admin MFA reviews, authorized payment in sandbox confirms valid booking, driver sees assignment, delivery evidence is received, and proper financial/report records are visible to the permitted roles. Include negative tests: unauthorized access, duplicate requests, expired booking holds, webhook tampering, session expiry, failed worker/provider, and cross-account isolation.

Current operational limitation: no verified Render backend deployment, production database/provider configuration, end-to-end production tests or legal approval is established by this commit. No production financial/device flags are enabled.
