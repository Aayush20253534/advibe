# Optional providers

Cloud storage, Cashfree and Google Maps are independently disabled by default. An omitted switch means `false`; only the literal string `true` enables a provider. Invalid values fail configuration validation. Existing credentials never implicitly enable a provider.

| Environment | Switch | Default | Configuration required only when enabled |
| --- | --- | --- | --- |
| Backend | `CLOUD_STORAGE_ENABLED` | `false` | `KYC_S3_BUCKET`, `KYC_S3_REGION`, `CREATIVE_S3_BUCKET`, `CREATIVE_S3_REGION`; AWS workload IAM or paired `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` |
| Backend | `CASHFREE_ENABLED` | `false` | `CASHFREE_ENV` (`sandbox` or `production`), `CASHFREE_CLIENT_ID`, `CASHFREE_CLIENT_SECRET`, `CASHFREE_NOTIFY_URL` |
| Frontend | `NEXT_PUBLIC_GOOGLE_MAPS_ENABLED` | `false` | `NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY`, restricted to the Maps Embed API and approved website referrers |

For local use, copy the root `.env.example` to `.env.local` and the backend template to `backend/.env`. The backend development commands load `backend/.env`. Hosted deployments use their platform environment settings; `npm start` does not read a backend `.env` file. The Render staging template sets both backend switches to `false` and does not request optional provider credentials.

```dotenv
# Backend: initial auth/dashboard testing
CLOUD_STORAGE_ENABLED=false
CASHFREE_ENABLED=false
```

```dotenv
# Frontend
NEXT_PUBLIC_GOOGLE_MAPS_ENABLED=false
```

Restart the API and workers after changing backend switches. Rebuild/redeploy the frontend after changing either Google Maps variable because `NEXT_PUBLIC_` values are compiled into the browser bundle. Do not put S3 or Cashfree credentials in frontend variables.

## Behavior while disabled

- Registration, email verification, login, password reset, sessions and provider-independent modules continue to use the real database. Database connections, auth/session secrets, CORS and production email/MFA/CAPTCHA settings remain required.
- Storage upload intents, completion, signed downloads/previews and KYC scan callbacks return HTTP 503 `CLOUD_STORAGE_DISABLED`. No upload intent records are created. Creative workers exit before connecting to the database or claiming a job. Device players receive no new media URLs; existing STOP-manifest behavior is retained.
- Payment orders, confirmation, refunds, reconciliation, payout beneficiary verification, payouts and Cashfree callbacks return HTTP 503 `CASHFREE_DISABLED`. Queued refund/payout workers exit before processing records. Historical payment and other authorized metadata reads remain available.
- Google Maps renders no load button or iframe and sends no map requests, even if an old embed key remains set. Published location lists remain available. This implementation uses the browser Maps Embed API; no backend Google geocoding key is used.
- `GET /api/v1/integrations/status` reports the backend `enabled.cloudStorage` and `enabled.cashfree` booleans, without secrets.

Disabling cannot revoke an S3 URL already issued before the restart, stop a financial transfer already submitted to a provider, or cancel an in-flight request. Use the existing short URL lifetimes and separately reconcile any provider activity that predates disabling. This switch does not delete stored files or historical records.

## Enabling later

Supply the relevant configuration, set that provider's switch to `true`, and restart/rebuild. Backend startup validates only enabled live providers and names missing/invalid variables without exposing their values. Cloud storage supports AWS's credential chain; absence of static keys is valid when workload IAM supplies credentials. Bucket permissions/versioning, IAM access and provider connectivity still need verification against the actual account.

Storage KYC retention, scan-secret and legal-agreement controls remain in effect. Cashfree's payment/refund adapters remain available; live payment, booking, payout, tax and release approval gates remain separate. The live Cashfree Payouts adapter is still unavailable pending provider integration/verification: setting `CASHFREE_ENABLED=true` does not implement or activate it.

`ADVIBE_EXTERNAL_MODE=mock` remains development/test-only. Explicitly enabled mock providers need no live keys, but the new switches still block them when false. Mock mode never supplies verified storage scans or actual payment settlement and is rejected in production. Production signup still requires real email delivery; provider flags do not bypass email verification.

## Verification scope

The automated auth suite exercises registration → captured verification email → verification → login/session → password reset → logout against disposable PostgreSQL with optional providers disabled. New checks cover strict flag parsing, conditional configuration, ignored leftover credentials, stopped workers, all disabled provider endpoints, preserved records and denied injected providers. Enabled provider contract suites explicitly opt in. These are synthetic tests, not proof that hosted email, Cashfree, S3, maps or hardware are configured and working live.
