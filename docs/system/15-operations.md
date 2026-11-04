# 15 — Operations, monitoring, backup, incidents

## Health signals

`GET /api/v1/health` is liveness only and cannot prove PostgreSQL is ready. `GET /api/v1/ready` probes the migrated database. The Next.js frontend exposes `/api/health` and `/api/ready`; the latter delegates to backend readiness and returns 503 on dependency failure.

## Background job roster

| Job | Command | Purpose |
| --- | --- | --- |
| Reservation expiry | `npm --prefix backend run reservations:sweep` | Expire provisional holds; release inventory slots |
| Creative processing | `npm --prefix backend run creative:worker` | Scan and normalize approved media (S3/FFmpeg/ClamAV required) |
| Delivery tick | `npm --prefix backend run delivery:tick` | Reconcile delivery plan/window states |
| GPS purge | `npm --prefix backend run gps:purge` | Retention and consent policy enforcement |
| Payout reconciliation | `npm --prefix backend run payouts:reconcile` | Independent provider confirmation; currently adapter unavailable |
| Refund reconciliation | `npm --prefix backend run refunds:reconcile` | Verify external refund states |
| Support dispatch | `npm --prefix backend run support:dispatch` | Lease durable jobs and create in-app notifications |

All jobs require an explicitly approved schedule/worker service. Code in `backend/scripts` does not mean these jobs are deployed. Run exactly one logically safe schedule per period, use idempotency and monitor failures.

## Monitoring recommendations

- Collect P95 latency, HTTP 5xx, startup failure/readiness, DB connection errors, rate-limit anomalies and auth denials (without exposing credentials).
- Alert on creative scan worker failures, stranded inventory holds, delivery schedule mismatch, offline hardware, missing consent, job dead letters and stale backups.
- Independently reconcile provider payment/transfer events and internal ledgers. A database status alone is not bank settlement.
- Configure `.github/workflows/b23-staging-monitor.yml` with approved staging URLs and a real recipient escalation policy.

## Backup and recovery

Use verified Neon PITR/offsite retention and encrypted `age` database dumps; never commit backup material. Test `backend/scripts/restore-drill.sh` only against an empty isolated test database. Measure RPO/RTO and record evidence. A code rollback does not rewind financial state and should not automatically apply destructive database rollbacks.

## Incident sequence

1. Identify the active commit and affected service; capture sanitized correlation IDs.
2. Stop new financial/device activity using appropriate feature gates if warranted; do not alter completed ledger records.
3. Check backend `/ready`, Neon connectivity, worker backlog and provider health.
4. Roll back code only to a schema-compatible approved commit, then verify migrations and dependency health.
5. Reconcile Cashfree, payouts, bookings and device evidence after recovery.
6. Document incident timeline, affected users, RPO/RTO, legal notification duties and remediation.

## Release checklist

Hosted CI pass; real staging signup/login/MFA and role/tenant tests; verified mail; controlled DB migration and restore; metrics/alerts; legal/privacy approval; sandbox provider acceptance; real hardware acceptance if activated; release SHA pinned; tested rollback procedure.
