# Remaining issues

Current checkpoint: 7 November 2026, branch `work/blinkmyad-production-readiness`. Historical redesign scores and workflow counts are not current acceptance evidence.

1. Chromium, Firefox and WebKit synthetic CI now passes with 45 saved screenshots and axe reports. Home median LCP is 3.45 s, above the 2.5 s goal. Wider hosted acceptance, manual assistive-technology testing, 200% zoom and field interaction performance remain unverified; see the scoped browser and performance reports.
2. Account-owned staging needs Vercel team authorization, Render workspace selection, isolated database/secrets/HTTPS and deployed origin checks.
3. Approved branding, helmet format, terms/privacy and versioned partner agreement remain owner/reviewer decisions.
4. Actual email/Turnstile, private versioned storage, scanning/processing and provider sandbox evidence are missing.
5. Merchant checkout acceptance/UI completion, a verified payout gateway and advanced map/device activity views remain partial. Existing financial/hardware flags stay disabled.
6. Commercial hosting and workers conflict with the free-only budget. No paid subscription was activated.
7. Hosted backup retention/key recovery, live restore, alerts, rollback, independent security review and final B23 admission remain unverified.
8. Legacy domain/demo models remain because regression tests import them; live routes do not use them. Retire only with equivalent preserved coverage.

Fixed in this pass: unused `ApiSection` renderer removed with assertions moved to active workflows; development banner removed from production layout; portal/public cursor handling repaired; auth recovery/expiry and relay boundaries hardened; current lockfiles and tooling advisory fixes added; stale browser locators and Firefox container ownership corrected; timeline, location badge and authentication CTA contrast repaired. Do not report these as remaining defects.

Exact actions: [known blockers](docs/KNOWN_BLOCKERS.md). Evidence and scope: [engineering report](docs/ENGINEERING_READINESS_REPORT.md), [QA results](docs/QA_RESULTS.md). No remaining blocker is waived by this file.
