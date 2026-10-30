# Development-only external service mock adapters

AdVibe has separate **backend database operations** and **third-party providers**. Core accounts, campaigns, permissions and data storage remain real PostgreSQL operations. `ADVIBE_EXTERNAL_MODE=mock` changes only third-party integrations in **NODE_ENV=development/test**. The backend refuses this setting with `NODE_ENV=production`.

## Supported simulation contracts
| Service | Mock behavior | What it does NOT do |
| --- | --- | --- |
| Cashfree PG | Order setup returns a mock-prefixed pending checkout session; GET order is ACTIVE; payments list is empty | Never charges a card, verifies a successful payment or confirms a booking |
| Cashfree refunds | A refund request remains PENDING | Never settles money or creates a credit note |
| Cashfree payouts | Beneficiary is NOT verified; transfer is refused | Never initiates a bank transfer or marks earnings PAID |
| Resend email | Writes local test email and verification code into `backend/.mock-local/mailbox.jsonl` with restrictive permissions | Never sends real email; no browser-accessible mailbox endpoint |
| Cloudflare Turnstile | Accepts only the fixed local developer token `advibe-local-mock-turnstile-accepted` | No real bot detection; NEVER deploy on a public server |
| Creative private storage | Returns an explicit service-unverified error | Does not accept files or claim malware scanning/ready media |
| Private KYC storage | Returns an explicit service-unverified error | Never accepts genuine identity documents or claims KYC approval |

The storage adapters intentionally fail closed rather than issuing fake URLs to collect private files. The rest of AdVibe's protected workflows can still be developed with seeded, synthetic, non-sensitive test fixtures. Synthetic fixtures and no-checkout states must not be represented as production deliveries, settlements, human impressions or approved real-world KYC.

## Local setup
1. Set `NODE_ENV=development`, `ADVIBE_EXTERNAL_MODE=mock` and use a dedicated local PostgreSQL database; apply migrations.
2. Set `AUTH_SECRET` (minimum 32 characters), `AUTH_WEB_ORIGIN` and `CORS_ORIGINS` to your exact local frontend origin. Set `MFA_ENCRYPTION_KEY` for Admin MFA.
3. Start the backend with `npm --prefix backend run dev` and the Next.js frontend with `npm run dev`.
4. Local email verification messages appear in `backend/.mock-local/mailbox.jsonl`. Treat this private file like an OTP database and do not publish it. Never use real users' email addresses or real ID documents in mock testing.
5. `GET /api/backend/integrations/status` shows `mode:mock` through the frontend relay; every public portal displays the mock-mode banner.

## Future real integration
Set `ADVIBE_EXTERNAL_MODE=live`. Connect Resend sender, Cloudflare Turnstile, private versioned S3 storage and processing worker, approved Cashfree merchant sandbox, verified payout and refund providers, followed by separate secure staging and B23 release admission. Production defaults and money/identity/provider approval gates are never bypassed by mock mode.

Mocks are **not a substitute for end-to-end testing with real provider sandbox environments**.
