# Provider integration status

Reviewed 7 November 2026. Database tests use disposable PostgreSQL and injected synthetic provider adapters. They do not prove a request reached a provider, a message was delivered, or money moved.

| Service | Code available | Verification and remaining boundary |
| --- | --- | --- |
| Google Maps | Optional `PublishedAreaMap`, shared by public and advertiser directories; official Embed `view` mode; finite coordinates, deferred load and close control | URL regressions pass; actual key, referrer restrictions, billing setup and browser rendering unverified. No GPS route or multi-marker inventory overlay is claimed. |
| Cashfree payments | Server-created order/session, signed raw-body webhook, reconciliation and immutable payment transitions | Synthetic payment/refund/idempotency tests pass; merchant sandbox credentials, duplicate webhook delivery and dashboard reconciliation still required. No real charge/refund initiated. |
| Cashfree payouts | Reviewed earnings ledger, payout policy/approval/reconciliation boundaries | Real payout gateway intentionally unavailable. A bank transfer adapter and beneficiary verification remain implementation work once the approved provider contract is available. Never infer a paid transfer from UI status. |
| AWS S3 private storage | Versioned/encrypted KYC and creative objects, short-lived signed access, independent verification | No bucket or IAM inspection performed. Existing adapters use AWS region/credential resolution, not an arbitrary S3-compatible endpoint. Do not substitute public storage or assume R2 is compatible with required versioning. |
| Media worker | Isolated processing path, FFmpeg validation and ClamAV clean-scan gate | Worker binaries, scanner definitions, scheduling and real upload scanning are unverified. Approval remains unavailable without scan evidence. |
| Neon | Prisma PostgreSQL datasource, pooled runtime/direct migration URLs, transactions and schema history | Fresh local PostgreSQL 16 migration/domain checks exercised. No customer database inspected or migrated. Neon branch, TLS, roles, quota and backup recovery still require staging verification. |
| Resend | Server-side email adapter; generic failure logging; verification/reset flows | Local mock mail tests only. Sender DNS and actual delivery to designated test accounts unverified. |
| Turnstile | Server-side token/hostname verification and contact flow | Public/secret credentials and allowed hostnames must be configured separately; provider verification untested. A frontend challenge alone does not authorize an enquiry. |
| Vercel | Existing Next.js project and release/readiness endpoints | Project `advibe` discovered, but detailed project access returned 403 for the connected team. Owner must authorize the team before inspection or staging configuration. No deployment created. |
| Render | Existing Blueprint and worker commands | Connector has no selected workspace. Owner workspace selection required; no services changed. Free web-service sleep is unsuitable for delivery/finance workers. |
| Analytics | Authoritative application reports; optional external analytics not enabled | No PostHog capture, cookies or identity data added. Define minimal consent-aware events before enabling external analytics. |

## Maps configuration

Enable only the Maps Embed API in an approved Google project. Set `NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY` in the frontend build environment. Restrict this public key to the exact approved HTTPS referrers and Maps Embed API. Use a separate key for development. Do not put a server credential in a `NEXT_PUBLIC_` variable. The current map layer makes no geocoding, Places, Routes or server Maps request.

Visitors explicitly choose **Load Google Maps**. Before that action there is no Google iframe. Only published catalogue coordinates are sent; no account, driver, device or booking identifiers are included. The area selector follows the currently fetched page, preserving pagination. The list remains functional when maps are unconfigured. The map is an area reference, not proof of a screen, booking or campaign delivery.

For a multi-marker map or authorized route history, use a separately approved Maps JavaScript integration and an account-scoped endpoint with consent/retention checks. Do not expose raw device coordinates through the public catalogue or turn on the blocked device/GPS relay paths.

References checked: [Embed modes and referrer policy](https://developers.google.com/maps/documentation/embed/embedding-map), [Embed pricing](https://developers.google.com/maps/documentation/embed/usage-and-billing), [provider setup](https://developers.google.com/maps/documentation/embed/quickstart). Embed is currently no-charge; credentials and project setup still need owner verification.

## Provider acceptance evidence

Capture non-secret request IDs and expected/actual outcomes in a restricted staging evidence store: verified sender delivery; successful and failed sandbox payment; duplicate/out-of-order signed webhook; independent reconciliation; sandbox refund; cross-account denied upload/download; wrong MIME/size/version rejection; clean and malicious scan fixtures; signed URL expiry; retention deletion; database restore. Record the exact commit, environment, operator, timestamp and provider mode. Never commit private documents, tokens, live identifiers or raw provider responses.
