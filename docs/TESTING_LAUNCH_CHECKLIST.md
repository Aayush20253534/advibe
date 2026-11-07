# Testing launch checklist

Verdict at this handoff: **Not ready** for a real-user controlled testing launch. Local engineering checks pass; account-owned staging, provider/legal gates and browser acceptance remain unresolved.

| Gate | Status | Required evidence / owner action |
| --- | --- | --- |
| Dedicated branch and logical phase commits | Complete | Review PR diff and reports; do not merge without approval |
| Source/build/database verification | Complete locally | 154 frontend / 222 backend tests, lint/types/build, migrations; remote CI separate |
| Dependency audit | Complete locally | 0 known advisories in both current lockfiles; repeat before deployment |
| Backup tooling drill | Complete on synthetic data | Hosted restore/key-custody/retention evidence still required |
| Remote CI | Unverified | Repository owner enables/authorizes Actions and reviews the exact PR SHA |
| Browser/mobile/visual/accessibility | Blocked | Repair managed preview or execute CI/staging matrix; review screenshots and keyboard/axe findings |
| Performance targets | Unmeasured | Record Lighthouse/Core Web Vitals on representative mobile device/network |
| Branding | Pending owner decision | Resolve approved BlinkMyAd logo/legacy artwork and helmet format conflict |
| Legal/privacy/agreement | Pending authorized reviewers | Approved terms, privacy, retention and versioned agreement/hash before collecting real data |
| Commercial hosting budget | Pending owner decision | Approve compliant plans; free-only constraint conflicts with Vercel commercial use and always-on workers |
| Vercel account access | Blocked | Authorize the connected team for project inspection/configuration |
| Render account access | Blocked | Select the intended workspace; inspect existing services and staged deployment settings |
| Staging DB/secrets/origins/TLS | Unverified | Isolated Neon or approved Postgres, least-privilege users, correct URLs, cookies, HTTPS and probes |
| Email / bot challenge | Unverified | Verified sender and delivered verification/reset; real Turnstile hostname/token checks |
| Private storage/media worker | Unverified | Bucket/version/encryption/IAM/CORS/retention plus scanner and signed-access cases |
| Cashfree sandbox | Unverified | Provider order/webhook/reconciliation/refund cases; merchant policies; no real transaction |
| Payout integration | Incomplete | Approved gateway/beneficiary adapter and reconciliation; remain disabled |
| Physical devices/GPS | Unverified | Provisioned keys, certified installation, consent/retention and pilot evidence |
| Monitoring/rollback | Unverified | Alert recipient, failure drill, recovery owner and compatible rollback proof |
| B23 admission | Not approved | Evidence template remains false/null; reviewers authorize exact commit only after required gates pass |

## Allowed feature modes

| Mode | Features |
| --- | --- |
| Local synthetic development | Real local database/auth/domain logic with explicitly configured development provider mocks; no real identity or financial data |
| Source implemented; staging verification required | Public pages, published catalogue, all role portals, account/campaign/support/notification records, admin reviews, authoritative reports |
| Optional and configuration-gated | User-triggered Maps Embed; enquiries/email; private signed uploads with independent verification |
| Disabled until evidence and approval | Bookable holds, live payments/refunds/invoices, agreement/KYC approval, processing/activation, device playback/GPS and bank payouts |
| Known partial implementation | Payout gateway unavailable; multi-marker/route map and merchant-hosted checkout acceptance require further integration work/evidence |

Start a real-user pilot only after the applicable gates are evidenced and reviewers approve its exact scope. Staging approval does not authorize commercial launch or physical/financial operations.
