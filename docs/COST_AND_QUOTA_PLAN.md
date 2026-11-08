# Cost and quota plan

Provider pages checked 7 November 2026. USD figures exclude taxes; exchange rates and merchant-specific quotations are not assumed. No paid plan, billing account, provider key or commercial transaction was activated in this work.

## Budget decision

The requested free-only hosting policy conflicts with a commercial Vercel launch and reliable always-on processing. Vercel Hobby is restricted to personal/non-commercial use. Render explicitly advises against production applications on Free instances. Preserve the current architecture and obtain an owner-approved hosting budget before commercial release.

An indicative small always-on baseline is **Vercel Pro $20/month + Render API Starter $7/month = $27/month**, before worker compute, object storage/egress, database overages, extra seats, domains and taxes. This is a planning floor, not a deployed or approved quotation. A ClamAV/media worker may need substantially more memory than a 512 MB Starter instance; size it from measured scans before approval.

An internal synthetic-only preview can use allowed free resources with accepted cold starts. It must not accept real identity documents, bookings, payments or unattended device activity. Do not use keep-alive traffic to disguise a sleeping free service as an always-on backend.

## Provider plan

Estimated usage is a planning assumption for roughly 20–50 testers, 100 synthetic campaigns and 10,000 page views/month; no usage telemetry was available.

| Provider / purpose | Current pricing or quota | Estimated testing usage | Risk and safeguard |
| --- | --- | --- | --- |
| [Vercel frontend](https://vercel.com/pricing) | Pro starts $20/month including $20 usage credit; [Hobby terms](https://vercel.com/legal/terms) exclude commercial use | 10k page views; <50k relay requests | Image transforms, functions and seats can add cost. Use spend controls/alerts, no paid activation without approval. |
| [Render API](https://render.com/docs/free) | Free: 750 instance-hours/workspace/month; sleep after 15 min, wake about 1 min; ephemeral filesystem. [Paid compute](https://render.com/articles/set-up-self-hosted-github-actions-runners-on-render): Starter 0.5 CPU/512 MB $7/mo, Standard 1 CPU/2 GB $25/mo | One API service; limited interactive testing | Cold starts exceed relay timeouts. Do not hold files on local disk. Free bandwidth/build overages can bill or suspend service; monitor workspace totals. |
| [Render workers](https://render.com/articles/how-much-does-cloud-application-hosting-cost-for-small-businesses) | Background workers have no Free instance tier; each service billed separately | Disabled until corresponding provider/policy approval | Media processing requires tested memory/CPU, scanner updates and independent scheduling. Do not run finance/delivery jobs as browser requests. |
| [Neon PostgreSQL](https://neon.com/pricing) | Free: 1 GB/project, 100 CU-hours/project/month, 5 GB egress/project; sleeps after 5 min; limited restore history up to 6 h or 1 GB changes | Target <0.5 GB, <50 CU-hours, <1 GB egress | Polling/jobs can prevent sleep; audit/telemetry growth consumes storage. Use pooled runtime connections, retention jobs and quota alerts. Free history is not a full backup policy. |
| [Resend email](https://resend.com/pricing) | Free: 3,000/month, 100/day, 3 domains | <500/month and <50/day | Verification/retry abuse can consume the daily quota. Verify sender DNS, preserve server rate limits, monitor sends; keep automatic overages off. |
| [Turnstile](https://www.cloudflare.com/products/turnstile/) | Free challenge service | One staging widget, <1k challenges | Restrict hostnames and verify tokens server-side; do not assume a client success is verification. Confirm account/widget limits in dashboard. |
| [Google Maps Embed](https://developers.google.com/maps/documentation/embed/usage-and-billing) | Embed requests currently no-charge with no request quota; API key/project setup required | <1k user-triggered area views | Restrict browser key to exact referrers and Embed API. No Maps JS/Places/Routes/geocoding calls introduced. Any expansion needs separate quota/billing review. |
| [Cashfree](https://www.cashfree.com/payment-gateway-charges/) | Published PG platform rate starts 1.95%; taxes/modes/merchant terms vary; promotional 0% is conditional | Sandbox only; ₹0 real transaction volume | Never assume promotion eligibility or free refunds/payouts. Obtain the merchant's written tariff and separate payout approval. Live flags remain false. |
| [AWS S3](https://aws.amazon.com/s3/pricing/) | Usage-based storage, requests, versions, transfer and optional features; region/account pricing applies | Planning envelope: 5 GB including versions, 10k writes, 50k reads, 20 GB egress | Price selected India region in calculator; request owner-approved cap (e.g. $5 test alert, not a guaranteed ceiling). Lifecycle noncurrent versions, separate KYC/creative buckets, no public access. Budgets are alerts, not universal hard stops. |
| [GitHub Actions](https://docs.github.com/en/billing/concepts/product-billing/github-actions) | Standard hosted runners in public repos are free; larger runners and private-repo allowances differ | ~20 PR runs/month; three browser jobs per run | Current repo public. Keep read-only job permissions, seven-day screenshot retention and no real data in artifacts; verify account storage/budget. |
| Analytics / monitoring | Existing logs and read-only health workflow; external analytics disabled | Health probes and short sanitized logs | Account-specific log quotas/alerts unverified. Avoid PII and unnecessary analytics events; approve any external monitoring plan separately. |

## Spending controls

Before enabling a provider, record account owner, plan, region, billing mode and an explicit monthly threshold. Check usage at 50%, 80% and 100% of the approved allowance. Restrict keys, disable unnecessary APIs, paginate records and expire temporary artifacts. Rate-limit risky operations and avoid automatic retries of financial mutations. Pause optional analytics/maps first on a quota incident; do not bypass scanning, identity privacy, ledger reconciliation or backup requirements to reduce cost.

Review rates and account limits immediately before launch; published pricing is not evidence of the connected account's entitlement. The existing S3 adapters require private versioned AWS storage; a cheaper storage provider must pass compatibility/security tests before substitution. Neon object storage is not automatically a drop-in replacement.
