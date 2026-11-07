# Security review and threat model

Scope: branch `work/blinkmyad-production-readiness`, source review, synthetic runtime tests and disposable PostgreSQL integration tests. Method: risk categories informed by [OWASP Top 10](https://owasp.org/projects/top-ten). This is not independent penetration-test signoff, certification or legal approval.

## Assets and trust boundaries

Assets: credentials/sessions, advertiser ownership, private identity documents, creative objects, inventory holds, payment/refund/earning ledgers, device secrets, consented location evidence and audit history. Actors: anonymous visitor, advertiser, driver, MFA administrator, device, worker and external provider. Browser input is untrusted; Express checks role/ownership/state inside database operations. Next relays only permitted API families. Provider callbacks and device requests use their own server verification and are not browser-relay routes.

## Findings and remediation

| Priority | Finding / threat | Change or existing control | Evidence / residual condition |
| --- | --- | --- | --- |
| High | Chunked or large bodies could exhaust relay memory before size checks | Bounded stream reader stops at 64 KiB inbound / 2 MB upstream; total 12-second budget and disconnect cancellation | Exact-limit, multibyte, oversize, stalled-source cancellation and actual route tests pass. Host connection/concurrency limits still required. |
| Medium | Relay copied unrelated site cookies and upstream cookies | Only `__Host-advibe_session` / `advibe_dev_session` forwarded; duplicate sessions preserved for backend rejection | Runtime cookie-isolation test and existing auth tests pass |
| Medium | Expired portal sessions left stale private UI visible | Shared idle expiry clears all three portals; backend remains authority | Types/build and auth tests pass; browser expiry flow still unverified |
| Medium | Public frontend lacked baseline response protections | `nosniff`, frame denial, referrer policy, camera/microphone/geolocation restrictions, limited CSP object/base/frame policy | Build records headers; real deployed headers/TLS unverified. No claim of full script CSP protection. |
| High advisory | Prisma tooling's `deepmerge-ts` and `effect` versions carried advisories | Scoped fixed transitive versions, preserving Prisma 6.19 and migration history | Client generation and full fresh DB/migration verification rerun. This application does not use Effect RPC in its request authorization path. |
| Medium advisory | TypeScript ESLint tooling's minimatch glob amplification advisory | Scoped minimatch 11.0.1 pin under typescript-estree | Lint, types and full frontend/backend checks rerun; do not lint attacker-supplied repositories with privileged secrets |
| Medium | Floating dependency installs and mutable action tags | Both npm lockfiles, `npm ci`, reviewed SHA-pinned checkout/setup-node/upload-artifact | Lock integrity/install checks; Actions still require remote execution evidence |
| Medium | Malformed ignore file could expose local mock mail | Repaired literal newline escapes; `.mock-local` ignored | Tracked working-tree scan found no high-confidence provider/private-key patterns; full-history secret scanning still required |

## Boundary review

| Threat | Source controls / tested behavior | Remaining operational requirement |
| --- | --- | --- |
| Broken access control / IDOR / tenant mixing | Auth principal role resolution, business memberships, owner-scoped reads/writes; API boundary, accounts, driver, KYC and admin suites | Cross-account deployed browser review |
| Credential/session abuse | Argon2 policy, random opaque session token hashes, secure HttpOnly production cookie, CSRF/origin enforcement, verified-email flow, admin MFA and session revocation | Verify sender delivery, MFA enrollment/recovery custody and deployed cookie origin |
| SQL injection / financial races | Prisma operations and parameterized `Prisma.sql`; serializable transactions/row locks; quote/hold/ledger/reconciliation tests | Production DB least privilege, pool sizing and concurrent pilot/load test |
| XSS / unsafe redirects | React text escaping, validated internal auth redirects, no arbitrary HTML injection found in reviewed application surfaces | Full nonce-based CSP plus browser validation remains deferred; do not treat baseline CSP as XSS elimination |
| SSRF / CORS / excessive relay permissions | Exact configured HTTPS backend origin in production, validated path segments, blocked webhook/device write routes, manual redirect rejection, bounded replies, exact backend origin allowlist | Validate trusted proxy topology. Never accept arbitrary caller-supplied forwarded IPs to repair rate-limit grouping. |
| Webhook forgery / replay / payment tampering | Server-created orders, raw-body signature checks, timestamps/idempotency and independent amount/currency/provider reconciliation | Actual merchant sandbox and duplicate/out-of-order delivery tests |
| Malicious private uploads | MIME/size/version validation, private signed operations and scanner gate; no public KYC URL fallback | Bucket/IAM/CORS/retention inspection and deployed clean/malicious scan fixtures |
| Device impersonation / fabricated delivery | Signed manifests, device sequence/time checks, installation gates, separate delivery evidence; device and telemetry suites | Physical provisioning, clock/key lifecycle, controlled hardware pilot |
| Logging / exports | Server-generated request IDs; redacted auth/bank fields; route templates and generic failures; scoped reports and CSV formula neutralization | Restricted log access/retention, alerts, and private backup custody |
| Financial administration | MFA roles, reviewed ledger states, policy flags, immutable audit events; no unrestricted UI status assignment | Approved earning/tax/refund policies; genuine payout implementation unavailable |

## Dependency decisions

Initial `npm audit`: frontend 8 moderate / 0 high; backend 7 moderate / 4 high (transitive reporting includes parents). Scoped overrides: `@typescript-eslint/typescript-estree > minimatch=11.0.1`, `@prisma/config > effect=3.20.0`, `@prisma/config > deepmerge-ts=8.0.0`. These are tooling dependencies. The deepmerge v8 change affects Map merging and types; this repo uses Prisma schema/environment configuration, with no custom Map-based Prisma config. Generation, migrations and the complete backend suite are compatibility gates. Remove overrides only after upstream packages contain patched versions and checks pass.

Advisories: [minimatch](https://github.com/advisories/GHSA-g3hv-75wg-m249), [deepmerge](https://github.com/advisories/GHSA-ggr8-5vv4-36mx), [Effect](https://github.com/advisories/GHSA-38f7-945m-qr2g). Final audit counts are recorded in the QA report; absence of audit findings does not prove absence of vulnerabilities.

## Prioritized remaining work

1. Before accepting real people/data: legal documents, account-owned staging, verified email, private storage/worker, access policy and restore evidence.
2. Before financial/hardware activity: actual provider sandbox, approved policies, unavailable payout gateway, hardware pilot and B23 admission evidence. Leave all flags disabled until then.
3. Before production review: cross-browser accessibility/security flows, load measurements, independent security review, full-history/provider secret scan, nonce CSP and validated host/WAF/rate-limit topology.

No real payment, refund, payout, KYC collection, production migration or device activation occurred during this review.
