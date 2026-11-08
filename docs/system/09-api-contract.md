# 09 — HTTP API contract, versioning and route status

## Actual routing rules

- Backend base path: `/api/v1`.
- Frontend browser requests: `/api/backend/<allowlisted-path>`; Next proxies securely through server-only `ADVIBE_BACKEND_ORIGIN`.
- Health: `GET /api/v1/health` checks the listener; `GET /api/v1/ready` checks database migration readiness.
- API errors use JSON `error.code`, `error.message` and request identifier. Non-API routes respond with structured 404 instead of HTML.
- Cookie-session writes require origin/CSRF guards and sometimes an `Idempotency-Key`; device endpoints and webhooks use non-cookie verification.
- Uploads use short-lived signed S3 URLs, not multipart file payloads through the application API.

## Current endpoint families

| Resource | Example endpoints | Protection / notes |
| --- | --- | --- |
| Sessions | `/auth/register`, `/auth/verify`, `/auth/login`, `/auth/mfa/verify`, `/auth/session`, `/auth/logout` | Public entry + protected session |
| Accounts | `/me`, `/businesses`, `/businesses/:businessId` | Session + business ownership |
| Drivers | `/drivers/me`, `/drivers/applications`, `/drivers/me/vehicles` | Driver role |
| Compliance | `/drivers/documents/upload-intents`, `/admin/driver-applications` | Private storage + Admin review |
| Geography | `/public/cities`, `/public/zones`, `/public/locations`, `/admin/locations` | Published public; Admin mutation |
| Screens | `/inventory/screens`, `/admin/devices/screens`, `/devices/heartbeat` | Session / separate signed device identity |
| Creatives | `/creatives`, `/creatives/upload-intents`, `/admin/creatives/:id/decision` | Advertiser/owner + Admin |
| Campaigns | `/campaigns`, `/campaigns/:id/submit`, `/admin/campaigns/:id/decision` | Business + Admin |
| Pricing | `/pricing/rules`, `/pricing/quotes`, `/admin/pricing/tax-policies` | Authenticated; tax gates |
| Reservations | `/reservations/holds`, `/campaigns/:id/bookings` | Booking flag + ownership |
| Payments | `/payments/orders`, `/webhooks/cashfree/payments` | Cashfree disabled pending approval |
| Delivery | `/admin/reservations/holds/:id/delivery/activate`, `/devices/manifest` | Confirmed bookings + device keys |
| GPS/evidence | `/devices/trip-events`, `/devices/playback-events`, `/campaigns/:id/exposures` | Consent/signed evidence |
| Finance | `/admin/invoices`, `/admin/refunds`, `/admin/payouts` | Independent finance policy/provider |
| Support | `/support/tickets`, `/notifications`, `/admin/jobs` | Role-specific |
| Audit | `/admin/reports`, `/admin/audit-events` | Admin MFA |

## Contract drift warning

`contracts/openapi.v1.json` is a historical B0–B14 snapshot and does **not** represent the entire latest API. Known differences include legacy `/devices/heartbeats` versus current `/devices/heartbeat`, and `/tickets` versus `/support/tickets`. Treat current source route declarations and tests as authoritative until the OpenAPI document is regenerated and reviewed; do not deploy generated clients against this stale snapshot.

## Route-wide test coverage

Run `npm --prefix backend run test:api-route-inventory` to enumerate all current router declarations and verify each major module retains a domain test file. Run `npm --prefix backend run test:api-boundaries` against an isolated disposable PostgreSQL DB to probe **every non-provider route** for public-read behavior and anonymous access/input rejection; a separate role matrix verifies representative privileged reads. For meaningful positive and negative business state transitions run all existing module integration suites (`npm --prefix backend run check`).

**Not a live API assertion:** These tests establish local registration/auth semantics and endpoint boundaries. Live Cashfree, S3/object storage and Google Maps are excluded and require separate credentialed staging acceptance tests.

## Current machine-readable route inventory

`contracts/api-routes.current.json` records methods and paths extracted from Express. Regenerate with `npm run contracts:update`; CI runs `npm run contracts:check`. It complements the historical B0 design schema without pretending that outdated request/response schemas are current. Domain schemas remain in the backend Zod definitions.
