# 14 — External services: connection and cutover gates

## Current status

Neon and Resend are reported configured. The repository has in-source adapters for Cashfree collection/refunds and private S3 storage but does not establish that real account credentials, private buckets, scanner workers or approved commercial terms are operational. Driver payouts are currently a fail-closed adapter stub. Google Maps integration is not yet implemented.

| Integration | Main files | Production dependency / gate | Current testing scope |
| --- | --- | --- | --- |
| Neon PostgreSQL | `backend/src/db`, Prisma schema | Migrations, TLS, backup/PITR, readiness | Real **disposable local** PostgreSQL only |
| Resend | `backend/src/modules/auth/email.ts` | Domain verification and successful real delivery | Email sender injected fake in local tests |
| Cloudflare Turnstile | `backend/src/modules/enquiries/captcha.ts` | Verified hostname + secret + frontend widget | Local injected CAPTCHA verifier; no real verification call |
| Cashfree PG/refunds | `payments/provider.ts`, `finance/provider.ts` | Merchant sandbox, callbacks, policies, reconciliation | **Excluded real provider**; internal fake contract tests exist |
| S3 creatives | `creatives/storage.ts`, `processor.ts` | Private versioned bucket + ClamAV/FFmpeg worker | **Excluded real storage** |
| S3 KYC | `kyc/storage.ts`, `kyc/settings.ts` | Private bucket, legal agreement and scanning | **Excluded real storage/scanner** |
| Cashfree Payouts | `earnings/provider.ts` | Actual provider adapter, verification, signed webhook contract | Default adapter refuses with 503 |
| Google Maps | No production adapter verified | New map/geocoding/routes code + restricted keys | **Excluded; not implemented** |
| Monitoring/alerts | B23 ops scripts and logging | Alert sink, dashboard, runbooks and owner signoff | Local log/readiness checks only |

## Never turn on flags as a substitute for integration

- `ADVIBE_EXTERNAL_MODE=mock` is development/test only; production explicitly rejects it.
- `PAYMENTS_ENABLED`, `BOOKING_HOLDS_ENABLED` and tax approval cannot be enabled until merchant/tax/operational gates are satisfied.
- `DEVICE_PLAYBACK_ENABLED` requires approved fleet and cryptographic device/manifests.
- `CREATIVE_WORKER_ENABLED` belongs to the isolated scanner worker, never a general web process.
- `B18_PAYOUTS_ENABLED` requires financial review, provider reconciliation and a real implementation.

## Planned Google Maps design

Use a restricted browser key for Maps JavaScript/Places and a separately restricted server key for authorized Geocoding/Routes. Do not put server keys under `NEXT_PUBLIC_*`. The existing geo database catalog remains the authorization/capacity source of truth; map markers are a presentation layer and must never imply paid availability.

## Cutover sequence

1. Establish a non-production provider account and scopes; verify intended webhooks/callback URLs and secrets.
2. Write adapter contract tests for happy path, error path, timeout, replay, bad signature and mismatched totals.
3. Exercise provider sandbox on a controlled staging environment with redacted logs.
4. Verify worker, circuit-breaker and reconciliation behavior.
5. Complete contracts, tax/privacy and operational approvals; only then enable production flags.

Keep external API keys out of Git, CI logs and documentation examples.
