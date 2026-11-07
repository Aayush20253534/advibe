# Known blockers and required owner actions

No commercial release is approved by this work.

| Blocker | Required action / evidence | Safe behavior |
| --- | --- | --- |
| Brand artwork conflicts | Confirm BlinkMyAd artwork and helmet format; legacy approved master remains preserved | Configurable branding; no invented official mark |
| Legal pages and driver agreement | Publish reviewed terms/privacy and versioned signed-off agreement/hash | Agreement acceptance and sensitive onboarding remain locked |
| Private creative/KYC storage | Configure private encrypted versioned buckets, least-privilege IAM, retention and scanner | Upload/approval unavailable without dependencies |
| Media worker | Deploy isolated patched FFmpeg/ClamAV worker with clean scan evidence | No unscanned media approval |
| Resend sender | Verify domain and sender; deliver verification/recovery to test accounts | No claim of email delivery |
| Cashfree | Merchant sandbox credentials, webhook/reconciliation/duplicate/refund test evidence and policy review | No real charge/refund/payout |
| Payout provider | Implement and verify approved gateway with beneficiary verification and reconciliation | Default unavailable adapter stays fail closed |
| Google Maps | Restricted browser key and approved billing; separately restricted server key only if geocoding is needed | Database inventory remains usable without maps |
| Physical screens | Certified hardware, installation, pairing keys and pilot evidence | No device activation or exposure claims |
| Deployment approvals | Account-owned staging, HTTPS, secrets, B23 evidence, recovery and operator signoffs | No approval flags set by this session |
| Render inspection | Connector has no selected workspace; explicit workspace selection required by connector | No service or configuration mutations |
| Commercial host plan | Confirm compliant hosting terms and budget; no paid plan activation authorized | Cost report documents constraints |

The connected Vercel account identifies project `advibe`; its existence does not establish current runtime health. GitHub Actions status must be checked on this branch/PR rather than inferred from earlier documentation.
