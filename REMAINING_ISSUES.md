# Remaining issues

What is still open after the redesign (M0–M9). Each item says who needs to act. None of these blocks the current deployment. All checks in [`docs/redesign/M9.md`](docs/redesign/M9.md) pass.

## Owner decisions

1. **GitHub Actions has never run.** The repository has `ci.yml` and `b23-staging-monitor.yml`, but GitHub shows 0 workflow runs. Every check in this redesign was run locally with the CI's exact command sequence. To have GitHub check each push, enable Actions under the repository's Settings → Actions → General.
2. **The format images don't match the brand rules.** The AI images show a pink "A" mark and the tagline "Your Brand On The Move". `docs/BRAND.md` says the megaphone logo is the only approved mark and that this tagline must not be used. Either approve them as illustrations or supply replacements.
3. **Helmet format: printed wrap or screen?** The helmet image shows a display screen, but the format is described as "a printed helmet design, not a screen". Decide which is right, and either the copy or the image changes.
4. **Partner agreement (unlocks driver onboarding steps 4–5).** No agreement version is published. Steps 4 (accept agreement) and 5 (submit) are locked with an explanation until a reviewed agreement exists.
5. **Identity document storage (`KYC_S3_*`).** This isn't configured on the live setup, so drivers can't upload documents. Admin document review already supports it.
6. **Resend sending domain.** Without a verified domain, Resend only delivers to the account owner's address. Verification and recovery emails to other people won't arrive until a domain is added and `AUTH_EMAIL_FROM` uses it.
7. **Legal pages.** Privacy and terms are labelled "Legal approval pending". Final, legally reviewed text is needed before real customer, driver or payment data is collected.

## Switched off on purpose

These stay off until providers, finance and legal approvals are in place. The UI says so where they would appear.

- Online payments and refunds (Cashfree)
- Driver payouts and settlements
- Identity (KYC) verification
- Media scanning and processing for creatives (approval needs an independent scan)
- Screen pairing, device keys and playback (not issued from the portal)
- Search indexing: `noindex` until `SITE_INDEXING_ENABLED=true`. This is why Lighthouse SEO is 66.

## Not verified

- **The deployed Vercel and Render sites.** This environment's network policy blocks them, so all checks ran against a local production build with the same backend code.
- **Real phones, Safari and Firefox.** Checks used Chromium at 360–1440 px.
- **Screens with many real records.** Locally there are no submitted campaigns, creatives with processed media, driver documents, earnings or payouts. These flows were checked with empty data and with the CI's intercepted backend, which sends identical requests (see M7).
- **Creative upload end to end.** It needs object storage and the processing worker.

## Technical follow-ups

- **`ApiSection` in `src/features/live/api-portal.tsx`** is unused but kept. It holds the only copies of `newIdempotencyKey` and `e.status===401` in that file, and two tests check for those strings (see M8). Moving those assertions to the live portal code that does the same work would let it be deleted. That is a test change, so it needs approval.
- **24 demo-era files that only tests use** (listed in [`docs/redesign/M8.md`](docs/redesign/M8.md)). No page uses them, but rules and model tests import them. Retiring them means retiring or rewriting those tests.
- **Dense files that aren't Prettier-formatted:** admin-live `common.tsx`, `operations.tsx`, `reviews.tsx` and `catalog.tsx`, and advertiser `operations.tsx` and `common.tsx`. Their exact-text security checks match compact code, so they keep their dense style. Reformatting them needs the tests to change at the same time.
- **The development banner adds about 0.09 CLS** because it appears after its status request. It isn't shown in production, and with it blocked CLS is 0. Its height could be reserved if the banner is also wanted on staging.
- **The repository's Playwright version doesn't match the pre-installed browser in this cloud environment.** The browser scripts were run with `PW_CHROMIUM_PATH=/opt/pw-browsers/chromium`. In CI, `npx playwright install` handles it.
