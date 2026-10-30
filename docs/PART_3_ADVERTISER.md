# Part 3 — Authenticated advertiser portal

## Source work completed
All advertiser route entrypoints use `AdvertiserPortal`, not demo Zustand UI or the generic B22 table. The public website, Admin and Driver portals are unaffected.

- **Dashboard:** persisted business and campaign records, status counts, no fake reach or profit.
- **Campaigns:** backend-owned list/filter, draft creation with 1–60 day schedule, detail editing with expected revision, approval submission with backend prerequisites.
- **Creatives:** signed upload intent, client SHA-256, direct HTTPS private-store PUT, backend completion verification, separate media scanning status, register a creative only after READY; Admin still reviews it.
- **Catalog:** published locations/formats and new `GET /api/v1/inventory/screens` returning only eligible paired screens with approved driver applications and published zone/city. No driver IDs, device credentials, or GPS. This catalog is not authoritative booking availability.
- **Pricing/finance:** live quote request using real campaign schedule, selected screen IDs and approved tax/rate policy, quote history, owned payment attempts. No fake successful booking/charge; checkout belongs to Part 6.
- **Account/operations:** own profile, business registration/update, support ticket and public replies, authenticated notification updates.
- **Reports:** campaign status breakdown and CSV derived only from fetched persisted campaigns, with CSV formula sanitization. No invented impressions or bank settlement metrics.

## Validation / operational constraints
- `npm run test:advertiser-live` checks source contracts and proxy allowlist; existing B22 Chromium smoke is updated for new advertiser pages.
- `npm run check` and full backend CI are required at the exact commit. Do not claim green CI until actual run results are visible.
- No real production completeness until Render, PostgreSQL, verified email, private S3/media worker, rate/tax policy and device fleet are provisioned. Backend release gates must remain enforced.
- Browser-side private uploads require a storage CORS policy permitting the actual HTTPS Vercel origin and signed PUT headers; do not proxy media bytes through the 64KB JSON relay.
- Booking holds, real Cashfree checkout, provider reconciliation, refunds and tax-reviewed invoices remain Part 6.
- True staging E2E must verify tenant isolation, creative scan/approval, campaign submission, quote creation and fail-closed errors with real API and database. CI browser mocks alone do not prove this.
