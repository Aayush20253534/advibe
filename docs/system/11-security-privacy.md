# 11 — Security, privacy and abuse resistance

## Trust boundary checklist

- HTTPS at every public edge; trust only the known reverse proxy hop.
- Server-side session role and status checks on every protected request; no client-selected privilege.
- Argon2id for passwords; Admin TOTP secret encrypted at rest, independent `MFA_ENCRYPTION_KEY`.
- `HttpOnly`, `Secure` production cookies, exact allowed origins, CSRF and scoped idempotency keys.
- Rate-limited unauthenticated auth and contact operations; Turnstile for public enquiry before launch.
- Raw signed provider webhooks with replay protection, independently fetched provider state and immutable financial records.
- Device Ed25519 authentication, nonce replay prevention, manifest signatures and revocation.
- Private encrypted versioned S3 buckets for KYC and creatives; content validation, malware scanning and approved retention.
- Redacted HTTP logs, request IDs, bounded pagination, safe CSV export, protected secrets in deployment providers.

## Data classification

| Type | Handling |
| --- | --- |
| Credentials/API keys/TOTP | Render/Vercel server secret storage only; never `NEXT_PUBLIC_*` |
| Sessions | Cookie and hashed server record; do not log raw tokens |
| Driver identification/KYC | Private restricted S3, signed short URLs, scan and legal retention policy |
| Raw trip GPS | Consent-scoped ingestion, retention review, scheduled purge; never claim human view counts |
| Media files | Private uploads and approved processed copies; never public pre-moderation URLs |
| Payment data | Provider tokens and verified status; no card credentials stored in app |
| Finance and audit | Integer paise, immutable event snapshots and restricted access |

## Release approval requirements

Security review must include role/ownership matrix, cross-tenant access, CSRF, cookies across deployed origins, admin MFA, signed webhooks, device replay, S3 policy leaks, malicious media, quota/abuse and recovery. Privacy and legal review must cover driver agreement, advertising terms, data retention and consent. Existing `B23_*_APPROVED` flags assert **actual signed-off evidence**, not readiness by toggling a boolean.

## What tests cannot prove

A passing local suite cannot prove real mail deliverability, KYC provider legitimacy, storage ACLs, bank settlement, deployed CSP, real device firmware or GDPR/Indian-law compliance. Provider/network and legal acceptance remain independent.
