# 10 — PostgreSQL schema, transactions and data ownership

## Core aggregates

- Identity: `User`, `Session`, OTP challenges, Admin MFA credentials.
- Organizations: `Business`, `BusinessMembership`, driver/vehicle/application records.
- Catalog: `City`, `Zone`, `Location`, `Screen`, device credentials and manifests.
- Campaign commerce: `MediaAsset`, `Creative`, `Campaign`, submissions/reviews, rates/tax policies, quotes, inventory holds/slots and payment orders.
- Execution: delivery plans/windows, trips, consent grants, GPS samples, playback proof and exposure aggregations.
- Finance: driver earning/settlement/payout, invoice, refund and credit notes.
- Operations: support tickets/messages, maintenance, durable jobs, notifications, immutable audit and outbox records.

See `backend/prisma/schema.prisma` for exact field names, indexes and enums; do not reconstruct schema from diagrams. Migration history under `backend/prisma/migrations/` is additive and ordered.

## Transactional invariants

1. A business creation also records membership and audit/outbox state.
2. Inventory holds reserve unique screen/day slots using transactional conflict checks. Booking decisions must not depend on frontend cache.
3. All money is stored in paise; calculated quote/tax/invoice snapshots are immutable commercial evidence.
4. Financial payouts require confirmed external evidence before paid ledger events.
5. Idempotency record scopes and request hashes prevent duplicate external/business actions.
6. Audit history and important financial events are append-only; application and DB constraints enforce this where implemented.
7. Device nonces, event IDs and payment/webhook IDs are deduplicated.

## Neon connections

`DATABASE_URL` is the pooled runtime URL and `DIRECT_URL` is the unpooled migration URL. TLS is required for production. Run `npm --prefix backend run db:migrate:deploy` as part of a controlled predeploy step. Use disposable locally provisioned PostgreSQL databases whose names include `_ci` or `_test` for all integration suites. **Never point the tests at live Neon.**

## Recovery

Use managed PostgreSQL PITR/offsite backups and `backend/scripts/backup-encrypted.sh` for encrypted exports. A restore drill must target a pre-created empty disposable database using `backend/scripts/restore-drill.sh`, never a production database. Recovery of payment-backed business state also requires financial reconciliation.
