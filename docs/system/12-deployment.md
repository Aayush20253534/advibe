# 12 — Deployment and environment setup

## Services

- Frontend: Vercel Next.js, source repository root.
- Backend: Render Node 22+, `rootDir: backend`, build TypeScript, migrate Prisma, start `dist/server.js`.
- Database: Neon PostgreSQL, separate pooled runtime and unpooled migration endpoints.
- Email: Resend (user reports it configured). Production still requires verified sending domain and delivery acceptance.
- Background workers: isolated scheduled processes, not tasks inside Next.js or the HTTP listener.

## Environment matrix (names from the current code)

| Location | Variable | Usage |
| --- | --- | --- |
| Render | `NODE_ENV=production` | Enforce production fail-closed rules |
| Render | `TRUST_PROXY=true` | Trust one managed reverse proxy hop |
| Render | `DATABASE_URL` | Pooled Neon runtime PostgreSQL, with TLS |
| Render | `DIRECT_URL` | Unpooled migration PostgreSQL, with TLS |
| Render | `AUTH_SECRET` | Unique strong session HMAC secret |
| Render | `MFA_ENCRYPTION_KEY` | Separate AES key, 64 hexadecimal chars |
| Render | `AUTH_WEB_ORIGIN` | Exact approved frontend HTTPS origin |
| Render | `CORS_ORIGINS` | Exact approved origin list including frontend |
| Render | `RESEND_API_KEY` | Real mail credentials, server-side |
| Render | `AUTH_EMAIL_FROM` | Verified sender address |
| Render | `ENQUIRY_TURNSTILE_SECRET` | CAPTCHA validation secret; required in production |
| Render | `ENQUIRY_TURNSTILE_HOSTNAME` | Exact site hostname; required in production |
| Vercel | `ADVIBE_BACKEND_ORIGIN` | Private Express HTTPS origin used by relay |
| Vercel | `NEXT_PUBLIC_APP_URL` | Canonical public frontend URL |
| Vercel | `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Public CAPTCHA key |
| Vercel | `SITE_INDEXING_ENABLED` | Keep false until public launch approved |

Render production server also requires `B23_RELEASE_STAGE` and staged/production release gate flags. Never claim approvals by setting flags without review evidence. `render.yaml` is deliberately a **staging** blueprint with the payment, payout, booking, tax invoice, playback and creative worker switches disabled.

## Safe boot sequence

1. Verify DNS and TLS; configure exact frontend/backend origins and secure cookies.
2. Verify Neon pooled/unpooled URLs, backup policy, authorized migrations and credentials.
3. Run `npm install --prefix backend`, `npm --prefix backend run db:validate`, `npm --prefix backend run db:migrate:deploy` in the approved environment.
4. Run backend Node process, check `GET /api/v1/health` and `/api/v1/ready` (database-backed).
5. Build/redeploy Vercel, check `/api/health` versus `/api/ready`, then signup, verification, session cookie and MFA.
6. Keep providers, device control and payments off until their separate staging tests and policy approvals.
7. Run negative tenant, CSRF, replay, database outage and incident tests before production promotion.

## Local test commands

```bash
npm install --prefix backend
npm --prefix backend run db:validate
npm --prefix backend run db:migrate:deploy
NODE_ENV=test DB_TEST_ALLOWED=true npm --prefix backend run check
```

These commands require an explicitly disposable LOCAL PostgreSQL database; the API suite blocks running against Neon or other remote databases. CI environment details are in `.github/workflows/ci.yml`.

## Naming

Brand rebranding to BlinkMyAd does not automatically rename existing `ADVIBE_*` environment variables, database object names, cookies, scripts or migration history. Keep existing identifiers until coordinated frontend/backend changes are tested.
