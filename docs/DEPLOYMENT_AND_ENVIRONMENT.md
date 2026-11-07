# Controlled staging deployment and environment guide

No staging service was created or changed. Vercel project details returned team-access 403; Render requires workspace selection. The owner must restore connector access, choose compliant hosting and designate staging resources before execution. Existing B23 approval flags are attestations, not troubleshooting switches.

## Topology and separation

Browser → HTTPS Next.js frontend → same-origin `/api/backend/*` relay → HTTPS Express API → pooled PostgreSQL. Only the API/isolated workers hold database/provider credentials. Use a separate Neon project/branch, private storage prefixes/buckets, mail sender and sandbox merchant environment for staging. Keep production data out of PR previews and CI.

Runtime: Node 22+; committed lockfiles; Next 16.4.2, React 19.3.1, Express 5, Prisma 6.19.0. Frontend root: repository root, `npm ci`, `npm run build`. Backend root: `backend`, `npm ci`, `npm run build`, start `npm run start`. `render.yaml` keeps automatic deployments off and commercial flags false. Its predeploy migration step requires a supported paid service; on an approved test host without predeploy support, a designated operator runs migrations once from a secured job before deployment.

## Environment ownership

| Scope | Variables | Requirements |
| --- | --- | --- |
| Frontend public build | `NEXT_PUBLIC_APP_URL` | Exact approved HTTPS origin; no credentials/path/query. Rebuild to change public values. |
| Frontend server | `ADVIBE_BACKEND_ORIGIN`, `SITE_INDEXING_ENABLED=false` | Exact owned HTTPS API origin. Never expose API/server secrets as public values. |
| Optional browser integrations | `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY` | Public keys restricted to exact staging domains/APIs; Maps loads on request. |
| API process | `NODE_ENV=production`, `HOST`, `PORT`, `CORS_ORIGINS`, `AUTH_WEB_ORIGIN`, `TRUST_PROXY` | Exact allowed frontend origin; validate hosting proxy hops. Do not trust arbitrary forwarded IP headers. |
| Database | `DATABASE_URL`, `DIRECT_URL` | Runtime pooled URL; direct migration URL; TLS required on hosted databases; separate least-privilege roles. |
| Session/MFA | `AUTH_SECRET`, `MFA_ENCRYPTION_KEY` | Independent generated secrets; MFA key 64 hex chars. Store only in provider secret manager. Enroll authorized admin using documented operator flow. |
| Email/enquiries | `RESEND_API_KEY`, `AUTH_EMAIL_FROM`, `ENQUIRY_TURNSTILE_SECRET`, `ENQUIRY_TURNSTILE_HOSTNAME` | Production mode requires verified configuration. Bare sender address; actual test delivery/challenge verification needed. |
| Private storage/agreements | `KYC_S3_*`, `CREATIVE_S3_*`, IAM, `KYC_SCAN_SECRET`, retention, agreement/privacy version/hash | Configure only after privacy/legal approval. Private encrypted versioned buckets; signed operations and scanner evidence. |
| Provider finance | `CASHFREE_ENV`, `CASHFREE_CLIENT_ID`, `CASHFREE_CLIENT_SECRET`, notification URL and policy flags | Sandbox only until separate financial authorization; secret/backend scope only. |
| B23 admission | `B23_RELEASE_STAGE`, staging/production approvals and matching SHA fields | Real reviewed evidence and named operator signoffs. This session sets none true. |

Authoritative templates: `.env.example`, `backend/.env.example`, `render.yaml`. Development alone may use `ADVIBE_EXTERNAL_MODE=mock`; production mode rejects mock providers. Do not point production settings at local mock mail or use public KYC URLs.

## Staging procedure

1. Verify the exact PR commit has green remote CI and reviewed browser artifacts. Resolve brand/legal/provider blockers applicable to the test cohort.
2. Create approved isolated database/storage resources. Take an encrypted backup if migrating an existing staging database; verify restore access separately.
3. Apply existing migrations with `npm --prefix backend run db:migrate:deploy` using the direct staging URL. Never edit applied migrations or use reset/push against shared data.
4. Set server secrets and exact origin configuration; authorize staging admission only with actual evidence. Build/deploy the API, then the frontend. No paid plan or commercial feature activation is implied by this guide.
5. Verify `/api/v1/health` and `/api/v1/ready` on the API; `/api/health` and `/api/ready` on the frontend. A liveness 200 is insufficient. Run `probe:staging` against the two approved HTTPS origins.
6. Test email verification/reset, MFA, session expiry/revocation, role isolation and unavailable-provider behavior across the deployed origins. Capture secure-cookie/CSRF results, not cookie contents.
7. Execute provider sandbox/worker cases from `PROVIDER_INTEGRATION_STATUS.md`. Keep unapproved features disabled and state their availability to testers.
8. Configure log access, uptime/error/queue/quota alerts and operator escalation. Exercise a deliberate staging alert and rollback, then record evidence IDs and reviewer names in a private copy of the B23 template.

## Worker inventory

| Command in backend | Trigger / safe admission |
| --- | --- |
| `creative:worker` | Dedicated isolated worker; approved private storage and patched FFmpeg/ClamAV; scan gate required |
| `reservations:sweep` | Scheduled expiry after booking holds approved |
| `delivery:tick` | Scheduled delivery transitions only after installation/hardware admission |
| `gps:purge` | Approved retention schedule; no raw GPS in logs |
| `payouts:reconcile` | Verified payout gateway/policy required; currently unavailable |
| `refunds:reconcile` | Approved Cashfree sandbox/policy first; no real refund in development |
| `support:dispatch` | Durable notification lease/retry dispatcher; monitor pending age and dead letters |

Set schedules from existing command contracts and expected workload; run one controlled job first, verify deduplication/leases, then schedule. No new scheduler or paid worker was provisioned.

## Rollback and monitoring

Pin and retain the last verified frontend/backend commit and environment version. Pause affected mutation/worker admission, deploy the previous compatible artifact, and probe health/auth/readiness. Database migrations are forward-only; do not blindly roll back a schema. Recover into a separate database and reconcile state under the recovery runbook before changing connection secrets.

The existing `b23-staging-monitor.yml` performs read-only six-hour HTTPS checks only when the owner configures both staging origin repository variables. Its existence does not prove alerts reach an operator. Set a named incident owner, test an alert, and review 5xx rates, readiness failures, DB connections, stale jobs, scanner failures, webhook reconciliation and quota usage. Do not dump private provider payloads into logs or public Actions artifacts.
