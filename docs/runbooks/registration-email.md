# BlinkMyAd registration and verification-email failures

## Observed production issue, 5 November 2026

Render logs confirmed `DELIVERY_UNAVAILABLE` (503) followed by an email uniqueness violation (409). The original registration logic inserted a PENDING account before asking Resend to deliver a verification message, then rejected every re-registration attempt. The source now allows the same unverified account to resume with the **same password and role**; it does not overwrite account details. Verified accounts and wrong passwords still yield 409.

## Email provider setup (independent of the code fix)

The source cannot force a rejected email to deliver. In the BlinkMyAd Render API service, verify:

1. `RESEND_API_KEY` is a current Resend Sending-access API key.
2. `AUTH_EMAIL_FROM` is a **bare sender address** (e.g. `noreply@blinkmyad.com`) using a domain that Resend shows as **Verified**. Do not use `onboarding@resend.dev` for real customer registrations; that sender is restricted to test recipients.
3. Domain SPF/DKIM records shown in Resend are published and verified.
4. `AUTH_WEB_ORIGIN` points to the canonical HTTPS frontend, and its origin is listed in `CORS_ORIGINS`; the URL in verification email must be reachable.
5. Check Render application logs after a controlled registration attempt. Updated sender logs only an HTTP status and sanitized provider error **name** (no key, recipient or provider message). For example, HTTP 403 with `validation_error` commonly indicates sender-domain authorization problems.

Do not log or post actual API keys or verification codes. Do not modify user rows or delete pending accounts to suppress conflicts.

## Client-facing recovery

- **503 `DELIVERY_UNAVAILABLE`**: A PENDING account may exist. Once email is operational, retry registration with the original password, or use **Resend verification email**.
- **409 `ACCOUNT_EXISTS`**: A verified account cannot be registered again. Sign in or use account recovery. If pending, the resend endpoint sends a fresh verification link to the original email, without exposing status.
- **429 `RATE_LIMITED`**: Stop retrying; wait for rate windows.
- **422 `VALIDATION_ERROR`**: New passwords require at least 12 characters, an ASCII uppercase letter, an ASCII lowercase letter, and a non-whitespace symbol. Existing users may still log in with previously accepted passwords; new password resets must follow the updated policy.
- Verification links contain the challenge ID; do not paste a raw code on the generic signup form.

## Test plan

The backend integration test simulates a failed delivery, a successful resume to the same PENDING user, a wrong-password 409 and final verification/active-account duplicate prevention. Run it only against a disposable loopback PostgreSQL database:

```sh
npm --prefix backend run test:auth
npm --prefix backend run test
npm run test:integration
```

The new standalone password-policy test runs in backend `npm test` without database or provider credentials. A successful code build does not confirm Resend account/domain configuration or deliverability.
