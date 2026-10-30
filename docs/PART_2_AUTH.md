# AdVibe Part 2: Auth and permissions

## Source work implemented
- Advertiser/Driver register using the strict Express auth API (no Admin self-registration).
- Verification email includes a direct `/verify?challengeId=<uuid>` link, with the six-digit code delivered only through email. Resend invalidates older challenges and uses a generic anti-enumeration response.
- Login, Admin MFA, password reset and sign-out use server-issued HTTP-only cookie sessions. Role redirects are constrained to server-confirmed roles.
- Reset credentials are read from the URL fragment into component state, then removed from browser location.
- API session validation rejects expired sessions. Portal data is cleared when an API returns HTTP 401, and sessions are revalidated when users return to the tab.
- Backend already enforces Argon2id, status, Admin MFA, CSRF, rate limits, role permissions and tenant isolation on every protected request.

## Tests
- `npm run test:auth-contract` validates redirect boundaries and API contracts.
- `npm run test:auth-browser` checks UI flows with intercepted contract responses, not a live backend.
- Backend `test:auth` and `test:security` exercise real Express+disposable PostgreSQL sessions, email confirmation, Admin MFA, CSRF and account permissions.
- CI runs the API-mode Chromium checks and the new auth browser contract. An actual green CI result must still be confirmed.

## Deployment gate
The new Vercel site `https://advibe-zeta.vercel.app` must have `ADVIBE_BACKEND_ORIGIN` set to a verified Render HTTPS API. On Render, use a dedicated migrated PostgreSQL database and set `CORS_ORIGINS` and `AUTH_WEB_ORIGIN` to the exact Vercel origin. Configure `AUTH_SECRET`, `MFA_ENCRYPTION_KEY`, a verified Resend sender and private operator MFA enrollment. These are server secrets, not public frontend variables. Production B23 legal/security gates remain outstanding. No real staging E2E or deployment success is asserted by source tests alone.
