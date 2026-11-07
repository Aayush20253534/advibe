# Feature audit

Initial source inspection at `d2ac1f3`, 7 November 2026. Verification updates belong in `ENGINEERING_READINESS_REPORT.md`; this table captures the baseline, not a certification.

| Module | Baseline classification | Source / unverified boundary |
| --- | --- | --- |
| Public website | Implemented but not verified this session | `src/app/(site)`, landing motion, 12 pages; legacy branding conflicts |
| Registration/login/recovery | Implemented but not verified | Backend auth, BMA forms; actual email sender unverified |
| Advertiser dashboard | Implemented but not verified | `features/advertiser-live`, campaigns/workflows/operations |
| Driver dashboard | Implemented but not verified | `features/driver-live`; agreement and storage gates |
| Administration | Implemented but not verified | `features/admin-live`, MFA-protected backend |
| Campaign lifecycle | Implemented but not verified | Campaign transactions, revisions, review, scheduling |
| Creative upload/approval | Blocked by external dependency | Private S3 + independent ClamAV/FFmpeg worker |
| Inventory | Implemented but not verified | Geo/devices models; physical supply unverified |
| Location discovery | Partially implemented | Database discovery exists; Google Maps adapter missing |
| Pricing/booking | Implemented but not verified | Quotes, holds and serializable inventory transactions; approval flags off |
| Payments/invoices/refunds | Blocked by external dependency | Cashfree adapters and reconciliation; sandbox and statutory details unverified |
| Devices/playback | Blocked by external dependency | Signed player API exists; hardware/keys/installation not verified |
| GPS/delivery evidence | Blocked by external dependency | Consented telemetry exists; device reports are not human impressions |
| Earnings/payouts | Partially implemented | Reviewed ledger exists; production payout gateway deliberately unavailable |
| Support/notifications | Partially implemented | Tickets and in-app notifications exist; scheduled dispatch not verified |
| Analytics/reports | Implemented but not verified | Backend reports from authoritative records; no fabricated data |
| Security | Implemented but not fully verified | Session, ownership, MFA, replay controls; relay resource limits need repair |
| Operations | Partially implemented | B23 gates/backup scripts/CI exist; live drill and monitoring unverified |

All application directories and route families were inventoried; there is no justification for a rewrite. Source tests are mostly contract/text assertions and cannot prove browser behavior or provider integration. The full legacy suite initially has two failing assertions; see `TESTING_BASELINE.md`.
