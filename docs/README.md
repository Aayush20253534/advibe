# BlinkMyAd engineering documentation

BlinkMyAd is the product name for the repository originally built as AdVibe. Legacy `ADVIBE_*`, `advibe_*`, existing database migrations and paths remain intentionally unchanged until separately reviewed migrations are approved. **Do not rename them to make the branding look tidy.**

## Current system documentation

1. [System architecture](system/01-system-architecture.md)
2. [Identity, sessions, authorization](system/02-identity-access.md)
3. [Advertiser and campaign workflow](system/03-advertiser-campaigns.md)
4. [Driver, vehicle and KYC workflow](system/04-driver-onboarding.md)
5. [Geography, inventory, pricing and bookings](system/05-inventory-bookings.md)
6. [Screens, scheduling and telemetry](system/06-delivery-devices.md)
7. [Payments, invoices, earnings, payouts](system/07-finance.md)
8. [Admin, support and notifications](system/08-admin-support.md)
9. [API conventions and current implementation](system/09-api-contract.md)
10. [Data consistency and migrations](system/10-data-model.md)
11. [Security, privacy and data handling](system/11-security-privacy.md)
12. [Deployment and environment variables](system/12-deployment.md)
13. [Testing and verification runbook](system/13-testing.md)
14. [External service integration gates](system/14-integrations.md)
15. [Monitoring, backup and incidents](system/15-operations.md)

## Source hierarchy

- **Runtime source of truth:** `backend/src/`, `src/app/api/backend/`, `src/services/api-route-policy.mjs`.
- **Database source of truth:** `backend/prisma/schema.prisma` and committed migrations.
- **Executable API coverage:** `backend/tests/route-inventory.mjs`, `api-route-inventory.test.mjs`, `api-boundaries.integration.test.mjs`, and domain integration tests.
- **Historical milestone specifications:** `docs/backend/B0_*.md` through `B23_*.md`; interpret as historical, not production release approvals.
- **Legacy OpenAPI snapshot:** `contracts/openapi.v1.json` is not fully synchronized with current routers. Never generate production clients from it without reconciliation.

Status categories: **implemented in source** ≠ **tested against disposable PostgreSQL** ≠ **verified on staging** ≠ **approved in production**.

External provider exclusions for this test pass: live Cashfree requests, private object storage/S3, and Google Maps. No real charge, refund, payout, document upload, or geolocation provider call is made by the new cross-module boundary suite.
