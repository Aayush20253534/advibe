# AdVibe

AdVibe is a Next.js 16 frontend and an Express/TypeScript + Prisma/PostgreSQL backend for mobile digital-screen advertising. The repository contains backend milestones B0–B23.

## Integration cutover: Parts 1–2

The application now uses **authenticated backend API routing only**. There is no runtime demo switch. Login, signup and role portals use the Express API through the same-origin Next.js server relay at `/api/backend/*`. When the backend is missing, requests fail closed. No sample user, fictional payment, or seeded campaign is substituted.

Part 2 adds server-confirmed role redirects, email-verification links and resend, Admin MFA session checks, reset-token handling and session-revocation UX. See [Part 2 authentication](docs/PART_2_AUTH.md).

Part 3 replaces the temporary advertiser tables with dedicated authenticated dashboards, campaign drafts/edits/submission, private creative upload lifecycle, eligible screen discovery, pricing quotes, account management, billing records, reports, support and notifications. Read [Part 3 advertiser integration](docs/PART_3_ADVERTISER.md). Checkout and real payment operations remain Part 6; deployment and staging E2E are separate release gates.\n\nThe former standalone demo components and fixtures remain **unreferenced by the live entry routes** pending complete deletion during the final cleanup phase. Legacy feature pages must still be migrated to dedicated API-backed UI; today's API portal is a limited functional bridge, not the finished production experience. The public marketing site remains available.

## Local configuration

Run Node.js 22+ and PostgreSQL 16. Provision backend environment variables as described in [backend documentation](backend/README.md) and apply Prisma migrations. Then create `.env.local` from `.env.example`, ensuring `ADVIBE_BACKEND_ORIGIN` points to your actual API server.

```bash
npm install
npm --prefix backend install
npm --prefix backend run db:migrate:deploy
npm --prefix backend run dev
# In another terminal
npm run dev
```

The backend must use the exact frontend origin for `CORS_ORIGINS` and `AUTH_WEB_ORIGIN`. Production requires HTTPS, the full B23 release admission gates, an approved PostgreSQL instance, real operator MFA and separately provisioned providers.

## Verification

```bash
npm run check
npm run test:integration
npm --prefix backend run check
```

API-mode Chromium tests use intercepted backend responses, while backend integration tests use disposable PostgreSQL. They are **not a substitute for live staging E2E**. Until staging tests, deployment and independent provider approvals are complete, production readiness remains **blocked**.

See [B22 API integration](docs/backend/B22_IMPLEMENTATION.md), [B23 release handover](docs/backend/B23_IMPLEMENTATION.md) and [production blockers](docs/PRODUCTION_READINESS.md).
