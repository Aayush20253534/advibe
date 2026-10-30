# Part 4 — Authenticated Admin portal

## Delivered
- New `AdminPortal` replaces generic API table routing on all existing /admin routes. Backend Admin session and MFA are mandatory; session is rechecked when the tab becomes active. Session expiry or revocation clears privileged data.
- Dashboard and analytics read `GET /admin/reports`. Only backend PostgreSQL counts and independently confirmed financial amounts are displayed; no guessed impressions or profit. Backend CSV export is supported through the existing validated relay.
- Users: typed paginated account lists, role/status/search filters, audited suspend/reactivate with 20+ character reason, expected-status check and backend session revocation. No Admin self-change.
- Approvals: submissions and revision-checked campaign reviews, scanned/processed creative moderation, driver applications and document status evidence. The backend validates all preconditions and records audit events; mock storage never forges a successful KYC or media scan.
- Catalog: draft city/zone/location creation, guarded state publication, eligible screen and location assignment, read-only player status. Device pairing/key provisioning is **not** exposed through the frontend relay. Pricing rules support create/revise with version checks and exact paise units.
- Bookings: backend approved campaign discovery and campaign-scoped booking history, not synthetic reservations.
- Support: server-scoped tickets, status state machine and public/internal messages. Notifications can be marked read.
- Payments/refunds/settlements: read-only evidence and explicit disabled state while external providers are mocked. Financial reconciliation, payout transfer, refunds and checkout are deferred to Part 6 with real provider evidence.
- Audit: server-managed audit list and CSV export. No client-side fabricated audit events.

## Tests
- `npm run test:admin-live` validates new UI wiring, CSRF/idempotency, expected versions, backend guards and proxy allowlist.
- Existing B22 Chromium API-mode smoke updated for the new Admin UI and its suspend action.
- Existing backend integration tests exercise real PostgreSQL and server-authenticated Admin authorization. A green CI run at this commit remains required to certify success.

## Deployment and sign-off still pending
- Render + PostgreSQL, Admin-enrolled MFA, secure session config, email sender, and protected Vercel `ADVIBE_BACKEND_ORIGIN`.
- KYC/media storage worker, actual device attestation, Cashfree merchant sandbox and legal/tax approvals remain unavailable in development mock mode.
- Full authenticated staging E2E must demonstrate cross-role and cross-tenant denial, stale-decision conflicts, rejected creative storage mock, safe audit logging, CSRF and revoked sessions.

Do not interpret this source implementation as verified live production integration.
