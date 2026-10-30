# AdVibe

AdVibe is a Next.js 16 frontend and an Express/TypeScript + Prisma/PostgreSQL backend for mobile digital-screen advertising. The repository contains backend milestones B0–B23.

## Integration cutover: Part 1

The application now uses **authenticated backend API routing only**. There is no runtime demo switch. Login, signup and role portals use the Express API through the same-origin Next.js server relay at `/api/backend/*`. When the backend is missing, requests fail closed. No sample user, fictional payment, or seeded campaign is substituted.

The former standalone demo components and fixtures remain **unreferenced by the live entry routes** pending complete deletion during the final cleanup phase. Legacy feature pages must still be migrated to dedicated API-backed UI; today's API portal is a limited functional bridge, not the finished production experience. The public marketing site remains available.

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
