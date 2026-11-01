# AdVibe UI/UX audit (M1)

Date: 1 November 2026 · Commit audited: `c264088` (main) · No application code was changed for this audit.

## How this audit was done

| Item | Detail |
|---|---|
| Frontend | Production build (`next build` + `next start`) of `main`, port 3000 |
| Backend | Express API from `backend/`, real PostgreSQL 16, all Prisma migrations applied, `ADVIBE_EXTERNAL_MODE=mock` (mocked email, payments, payouts, KYC, media) |
| Relay | The frontend only accepts an HTTPS backend in production, so a local HTTPS proxy with a throwaway certificate was placed in front of the API. The relay's safety rules were not changed. |
| Accounts | One local test account per role (`audit-advertiser`, `audit-driver`, `audit-admin` @example.invalid). Admin signs in with a real authenticator (TOTP) code. All three signed in through the real `/login` form. |
| Data | Fresh accounts. The advertiser registered one business ("Audit fixture business") through the real Settings form. No creatives, campaigns, driver applications, screens or payments exist, so **most screens show their empty state**. |
| Routes | Every `page.tsx` under `src/app` (60 routes; the three `[section]` catch-alls were excluded, since every section in the navigation has its own route) |
| Widths | 390, 768, 1280, 1440 px; full-page JPEG screenshots (240 files in `screenshots/`) |
| Accessibility | axe-core 4.10 (WCAG 2.0/2.1/2.2 A and AA rules) at 1280 px on every route |
| Measured per width | Horizontal overflow, text under 12 px (1280), tap targets under 44 px (390), page height |
| Errors | Browser console errors, uncaught page errors, HTTP responses ≥ 400 |
| Raw data | `audit-results.json` |

### Not inspected

- **The deployed site** (`advibe-zeta.vercel.app`): this environment's network policy blocks it. Everything here comes from the same code built locally.
- **Populated states**: campaign lists and details, campaign submission, creative upload and review, driver applications, vehicles, assignments, earnings, settlements, admin review queues with records, payments. These need data that only real workflows (creative processing, KYC, payments) create, and those are mocked or switched off. `/advertiser/campaigns/[id]` was not visited because no campaign exists.
- **Real email flows** (verification and reset links), **Safari/Firefox**, real phones, and screen-reader walkthroughs.
- **Lighthouse and Core Web Vitals**: planned for M4 and M9.

## Headline numbers

| Measure | Result |
|---|---|
| Routes crawled | 60 (17 public/auth, 11 advertiser, 14 driver, 18 admin) |
| Horizontal overflow | **None** at any of the 4 widths |
| axe serious/critical | 12 routes affected: `color-contrast` on 10 routes, `nested-interactive` on 2. 0 critical. |
| Uncaught page errors | 0 |
| Network errors | `/driver/assigned-ads`, `/driver/campaigns`, `/driver/delivery`: `404 GET /api/backend/driver/assignments` |
| Role gating | Correct on every route tested (see Access control) |
| Text under 12 px | Homepage 26 elements, `/for-advertisers` 3, `/locations` 1 |
| Taps under 44 px at 390 px | Every route has some; worst: home and `/for-advertisers` (35), `/locations` (28), driver portal (17 on every page, mostly the horizontal tab bar) |

## Severity scale

- **Critical**: blocks a core task or misleads users about money, safety or reality.
- **High**: a core screen is hard to use, broken for one role, or fails WCAG AA on primary content.
- **Medium**: visible inconsistency or friction that undermines trust or efficiency.
- **Low**: polish.

## Findings

### Critical

1. **C1 · Driver "Assigned Ads", "Campaigns" and "Delivery" show "API route not found".** The frontend calls `GET /driver/assignments`. `contracts/` documents it as "B0 contract only; no runtime handler exists yet", so the backend returns 404 and the driver sees a red error plus "No records returned". This is a backend gap, not a design bug. The redesign (M6) must show an honest "Assignments are not available yet" state instead of an error. Building the endpoint is outside the redesign scope (no backend changes). Evidence: [assigned-ads 390](screenshots/driver_driver_assigned-ads_390.jpg).
2. **C2 · The driver portal shows raw database output.** The Overview shows the user UUID, `["driver"]` as JSON text and the lowercase enum `active` as large headings ([driver 390](screenshots/driver_driver_390.jpg)). `src/features/live/api-portal.tsx:15` turns any nested object into `JSON.stringify` text. Every driver screen is the same generic record viewer. This is the weakest experience in the product.

### High

3. **H1 · Portal routes are not real pages.** All three `src/app/(portals)/*/layout.tsx` files do `void children` and render a single component that picks a screen from the URL. The 47 portal `page.tsx` files never render. URLs still work (each one opens the right screen), but per-route metadata, loading and error boundaries, and code splitting are lost. Fixing this changes routing architecture, so it needs owner approval (proposal in M3).
4. **H2 · There is no stepped campaign flow.** *Confirmed answer:* the live editor at `/advertiser/create-campaign` is **one long form**: title, creative, dates, times and delivery days, then "Save campaign draft" ([create-campaign 1280](screenshots/advertiser_advertiser_create-campaign_1280.jpg)). Locations, screens, pricing and review happen elsewhere or not at all. The six-step wizard exists only in unreachable legacy code (`src/features/advertiser/wizard*.tsx`). For a new advertiser the form starts disabled, with "Upload and register a creative first", so the first-run path is a dead end that needs a guided order.
5. **H3 · The admin dashboard prints raw field names as labels.** Examples: "confirmed Booking Gross Paise", "period Difference Paise", "paid Unallocated Gross Paise". The labels say *Paise* while the values show *₹0.00*, and the casing is broken ([admin 1280](screenshots/admin_admin_1280.jpg)). On a finance screen this reads as unreliable.
6. **H4 · Colour contrast fails WCAG AA** on 10 routes. Green-on-mint badges (`#11834f` on `#e7f7ef`) on `/ad-formats`; white on brand orange (`bg-brand-orange`) on `/for-drivers`; orange-outline buttons on `/pricing`; `text-slate-400` metadata on `/admin/users`, `/admin/advertisers` and `/admin/ad-formats`; the selected-city chips on `/locations`; the FAQ number badges on `/help-center`; 11 nodes on `/design-system`.
7. **H5 · Nested interactive controls** on `/` and `/for-advertisers`: the advertiser/driver "goal" cards wrap one control inside another (`.aspect-[1.42/1]`). Keyboard and screen-reader users get confusing focus.
8. **H6 · The homepage India map has jagged black shapes inside the outline** ([home 1440](screenshots/anon_home_1440.jpg), "Explore our coverage" section). It looks broken on the primary marketing page.
9. **H7 · The portals share no components.** The live portal code (`features/advertiser-live`, `admin-live`, `live`) imports **zero** components from `src/components/ui`; only unreachable legacy code does (34 files). Each portal repeats its own class strings, so buttons, cards and alerts differ between portals.

### Medium

10. **MD1 · Three different portal looks.** The advertiser portal uses blue `#1768d3` on navy, admin uses purple `#6240d7` on indigo, and the driver portal uses a top tab bar with no sidebar. The header labels differ: "Advertiser" vs "LIVE API · DRIVER" vs "Admin".
11. **MD2 · The sidebar background stops short.** On advertiser and admin pages the dark sidebar ends partway down, leaving a pale strip below it ([advertiser settings 1280](screenshots/advertiser_advertiser_settings_1280.jpg), [admin 1280](screenshots/admin_admin_1280.jpg)).
12. **MD3 · The portals show a text wordmark, not the AdVibe logo.** The public site uses `BrandLogo`; the portals type "AdVibe" as text.
13. **MD4 · Copy written for engineers, not customers.** Examples: "SERVER-BACKED ADMIN OPERATIONS", "DRIVER / BACKEND", "These are server-computed PostgreSQL metrics…", "Only records returned by the authenticated AdVibe API are shown", "0 business account(s) associated with your login. Accounts have a backend-enforced limit."
14. **MD5 · The driver navigation is a horizontally scrolling tab bar on mobile.** On 390 px only three of the tabs are visible, with no hint that more exist ([driver 390](screenshots/driver_driver_390.jpg)). There are 17 taps under 44 px on every driver page.
15. **MD6 · Metrics are stacked one per row on mobile.** On `/advertiser` at 390 px, four large count cards (Businesses 1, Campaigns 0, Submitted 0, Approved 0) push the useful content below the fold ([advertiser 390](screenshots/advertiser_advertiser_390.jpg)).
16. **MD7 · Public footer and project labels look unfinished.** "Admin Portal (Demo)", "UI Components" (links to `/design-system`) and "© 2026 AdVibe. Frontend demonstration." (`src/components/layout/public-shell.tsx:91,100`).
17. **MD8 · Hard-coded colours everywhere.** There are 885 distinct hex values (1,341 uses in 83 `.tsx` files) despite tokens in `globals.css`.
18. **MD9 · Generic template patterns on the public site.** Examples: an all-caps eyebrow above every heading, headline words in a second colour, identical rounded card grids, "→" on most links, and taglines joined with middle dots ("Cinematic city · Vehicle screens · Connected locations").
19. **MD10 · Wrong text on the old login screen.** `src/components/auth/login-screen.tsx` still says "Enter demo email" and "Demo login account type". It is not the live login form (`api-auth-screen.tsx` is), but it ships in the codebase.

### Low

20. **L1 · Text under 12 px**: 26 elements on the homepage (hero feature captions, stat captions), 3 on `/for-advertisers`, 1 on `/locations`.
21. **L2 · The logo file is a 633 KB, 2048 px PNG** used at about 40 px tall. A resized copy would save over 600 KB on every first visit.
22. **L3 · No heading typeface**: headings and body text both use the system font stack, so there's little typographic hierarchy.
23. **L4 · Inconsistent page titles**: "Reports & Analytics", "Pricing & Commercial", "Screens & Devices" (admin) vs "Reports", "Billing" (advertiser).
24. **L5 · Dense, minified code style** with no Prettier, which makes UI changes hard to review.

## Things that work well

- Role gating is correct and fails closed on every route tested.
- No horizontal overflow at any width.
- No uncaught JavaScript errors on any route.
- The mocked-provider banner is visible on every page.
- The forms use real `<label>` elements, and login, signup and recovery have 0 axe violations.
- Admin MFA works through the normal login form.

## Access control (signed-in role vs route)

Every portal route was opened as a signed-out visitor and as each role. The URL never changes. The gate replaces the page content.

| Route | Visitor | Result |
|---|---|---|
| `/advertiser` | anon | Secure advertiser access — Secure advertiser access Authentication required Sign inRetry connection |
| `/advertiser` | advertiser | Overview — ADVERTISER WORKSPACE Overview Current business Audit fixture business Dashboard metrics ar |
| `/advertiser` | driver | Secure advertiser access — Secure advertiser access Insufficient permissions Sign inRetry connection |
| `/advertiser` | admin | Secure advertiser access — Secure advertiser access This account cannot access the advertiser portal. Sign inRetry co |
| `/advertiser/campaigns` | anon | Secure advertiser access — Secure advertiser access Authentication required Sign inRetry connection |
| `/advertiser/campaigns` | advertiser | Campaigns — ADVERTISER WORKSPACE Campaigns Current business Audit fixture business My campaigns Create |
| `/advertiser/campaigns` | driver | Secure advertiser access — Secure advertiser access Insufficient permissions Sign inRetry connection |
| `/advertiser/campaigns` | admin | Secure advertiser access — Secure advertiser access This account cannot access the advertiser portal. Sign inRetry co |
| `/driver` | anon | Live session required — Live session required Authentication required Secure sign in |
| `/driver` | advertiser | Live session required — Live session required Your authenticated account does not have access to the driver portal |
| `/driver` | driver | Overview — DRIVER / BACKEND Overview Only records returned by the authenticated AdVibe API are shown. |
| `/driver` | admin | Live session required — Live session required Your authenticated account does not have access to the driver portal |
| `/driver/earnings` | anon | Live session required — Live session required Authentication required Secure sign in |
| `/driver/earnings` | advertiser | Live session required — Live session required Your authenticated account does not have access to the driver portal |
| `/driver/earnings` | driver | Earnings — DRIVER / BACKEND Earnings Only records returned by the authenticated AdVibe API are shown. |
| `/driver/earnings` | admin | Live session required — Live session required Your authenticated account does not have access to the driver portal |
| `/admin` | anon | Secure Admin access — Secure Admin access Authentication required Sign in with Admin MFARetry secure session |
| `/admin` | advertiser | Secure Admin access — Secure Admin access This account has no Admin permission. Sign in with Admin MFARetry secu |
| `/admin` | driver | Secure Admin access — Secure Admin access This account has no Admin permission. Sign in with Admin MFARetry secu |
| `/admin` | admin | Dashboard — SERVER-BACKED ADMIN OPERATIONS Dashboard These are server-computed PostgreSQL metrics for  |
| `/admin/users` | anon | Secure Admin access — Secure Admin access Authentication required Sign in with Admin MFARetry secure session |
| `/admin/users` | advertiser | Secure Admin access — Secure Admin access This account has no Admin permission. Sign in with Admin MFARetry secu |
| `/admin/users` | driver | Secure Admin access — Secure Admin access This account has no Admin permission. Sign in with Admin MFARetry secu |
| `/admin/users` | admin | Users & Roles — SERVER-BACKED ADMIN OPERATIONS Users & Roles Users and access Refresh Only verified server |

## Route-by-route measurements

"axe (serious+)" lists rule id × number of affected elements. Screens link to the full-page screenshot at each width.

| Role | Route | H1 | axe (serious+) | Text <12px @1280 | Targets <44px @390 | Page height @390 | Network errors | Screens |
|---|---|---|---|---|---|---|---|---|
| anon | `/` | Your Brand. Their Journey. Everywhere. | nested-interactive ×1 | 26 | 35 | 6907px | — | [390](screenshots/anon_home_390.jpg) [768](screenshots/anon_home_768.jpg) [1280](screenshots/anon_home_1280.jpg) [1440](screenshots/anon_home_1440.jpg) |
| anon | `/about` | Turning Commutes into Brand Experiences | 0 | 0 | 16 | 5050px | — | [390](screenshots/anon_about_390.jpg) [768](screenshots/anon_about_768.jpg) [1280](screenshots/anon_about_1280.jpg) [1440](screenshots/anon_about_1440.jpg) |
| anon | `/ad-formats` | Your Brand on Every Vehicle | color-contrast ×4 | 0 | 16 | 7272px | — | [390](screenshots/anon_ad-formats_390.jpg) [768](screenshots/anon_ad-formats_768.jpg) [1280](screenshots/anon_ad-formats_1280.jpg) [1440](screenshots/anon_ad-formats_1440.jpg) |
| anon | `/contact` | Let's Create Bigger Impact Together | color-contrast ×1 | 0 | 23 | 4884px | — | [390](screenshots/anon_contact_390.jpg) [768](screenshots/anon_contact_768.jpg) [1280](screenshots/anon_contact_1280.jpg) [1440](screenshots/anon_contact_1440.jpg) |
| anon | `/for-advertisers` | Take Your Brand On Every Ride | nested-interactive ×1 | 3 | 35 | 7891px | — | [390](screenshots/anon_for-advertisers_390.jpg) [768](screenshots/anon_for-advertisers_768.jpg) [1280](screenshots/anon_for-advertisers_1280.jpg) [1440](screenshots/anon_for-advertisers_1440.jpg) |
| anon | `/for-drivers` | Earn More With Every Ride | color-contrast ×1 | 0 | 16 | 6462px | — | [390](screenshots/anon_for-drivers_390.jpg) [768](screenshots/anon_for-drivers_768.jpg) [1280](screenshots/anon_for-drivers_1280.jpg) [1440](screenshots/anon_for-drivers_1440.jpg) |
| anon | `/help-center` | How Can We Help You? | color-contrast ×4 | 0 | 23 | 4805px | — | [390](screenshots/anon_help-center_390.jpg) [768](screenshots/anon_help-center_768.jpg) [1280](screenshots/anon_help-center_1280.jpg) [1440](screenshots/anon_help-center_1440.jpg) |
| anon | `/locations` | Find Locations for Your Ads | color-contrast ×3 | 1 | 28 | 3845px | — | [390](screenshots/anon_locations_390.jpg) [768](screenshots/anon_locations_768.jpg) [1280](screenshots/anon_locations_1280.jpg) [1440](screenshots/anon_locations_1440.jpg) |
| anon | `/pricing` | Transparent Pricing for Maximum Impact | color-contrast ×4 | 0 | 20 | 6100px | — | [390](screenshots/anon_pricing_390.jpg) [768](screenshots/anon_pricing_768.jpg) [1280](screenshots/anon_pricing_1280.jpg) [1440](screenshots/anon_pricing_1440.jpg) |
| anon | `/privacy` | Privacy Notice | 0 | 0 | 16 | 2076px | — | [390](screenshots/anon_privacy_390.jpg) [768](screenshots/anon_privacy_768.jpg) [1280](screenshots/anon_privacy_1280.jpg) [1440](screenshots/anon_privacy_1440.jpg) |
| anon | `/terms` | Terms & Conditions | 0 | 0 | 16 | 2048px | — | [390](screenshots/anon_terms_390.jpg) [768](screenshots/anon_terms_768.jpg) [1280](screenshots/anon_terms_1280.jpg) [1440](screenshots/anon_terms_1440.jpg) |
| anon | `/login` | One platform. Every journey. / Sign in | 0 | 0 | 7 | 921px | — | [390](screenshots/anon_login_390.jpg) [768](screenshots/anon_login_768.jpg) [1280](screenshots/anon_login_1280.jpg) [1440](screenshots/anon_login_1440.jpg) |
| anon | `/signup` | One platform. Every journey. / Create account | 0 | 0 | 7 | 921px | — | [390](screenshots/anon_signup_390.jpg) [768](screenshots/anon_signup_768.jpg) [1280](screenshots/anon_signup_1280.jpg) [1440](screenshots/anon_signup_1440.jpg) |
| anon | `/forgot-password` | One platform. Every journey. / Reset request | 0 | 0 | 7 | 921px | — | [390](screenshots/anon_forgot-password_390.jpg) [768](screenshots/anon_forgot-password_768.jpg) [1280](screenshots/anon_forgot-password_1280.jpg) [1440](screenshots/anon_forgot-password_1440.jpg) |
| anon | `/reset-password` | One platform. Every journey. / Set new password | 0 | 0 | 7 | 921px | — | [390](screenshots/anon_reset-password_390.jpg) [768](screenshots/anon_reset-password_768.jpg) [1280](screenshots/anon_reset-password_1280.jpg) [1440](screenshots/anon_reset-password_1440.jpg) |
| anon | `/verify` | One platform. Every journey. / Verify email | 0 | 0 | 8 | 921px | — | [390](screenshots/anon_verify_390.jpg) [768](screenshots/anon_verify_768.jpg) [1280](screenshots/anon_verify_1280.jpg) [1440](screenshots/anon_verify_1440.jpg) |
| anon | `/design-system` | One design language. Four experiences. | color-contrast ×11 | 0 | 6 | 3925px | — | [390](screenshots/anon_design-system_390.jpg) [768](screenshots/anon_design-system_768.jpg) [1280](screenshots/anon_design-system_1280.jpg) [1440](screenshots/anon_design-system_1440.jpg) |
| advertiser | `/advertiser` | Overview | 0 | 0 | 6 | 1344px | — | [390](screenshots/advertiser_advertiser_390.jpg) [768](screenshots/advertiser_advertiser_768.jpg) [1280](screenshots/advertiser_advertiser_1280.jpg) [1440](screenshots/advertiser_advertiser_1440.jpg) |
| advertiser | `/advertiser/ad-formats` | Ad Formats | 0 | 0 | 5 | 1514px | — | [390](screenshots/advertiser_advertiser_ad-formats_390.jpg) [768](screenshots/advertiser_advertiser_ad-formats_768.jpg) [1280](screenshots/advertiser_advertiser_ad-formats_1280.jpg) [1440](screenshots/advertiser_advertiser_ad-formats_1440.jpg) |
| advertiser | `/advertiser/billing` | Billing | 0 | 0 | 7 | 1498px | — | [390](screenshots/advertiser_advertiser_billing_390.jpg) [768](screenshots/advertiser_advertiser_billing_768.jpg) [1280](screenshots/advertiser_advertiser_billing_1280.jpg) [1440](screenshots/advertiser_advertiser_billing_1440.jpg) |
| advertiser | `/advertiser/campaigns` | Campaigns | 0 | 0 | 5 | 921px | — | [390](screenshots/advertiser_advertiser_campaigns_390.jpg) [768](screenshots/advertiser_advertiser_campaigns_768.jpg) [1280](screenshots/advertiser_advertiser_campaigns_1280.jpg) [1440](screenshots/advertiser_advertiser_campaigns_1440.jpg) |
| advertiser | `/advertiser/create-campaign` | Create Campaign | 0 | 0 | 12 | 1262px | — | [390](screenshots/advertiser_advertiser_create-campaign_390.jpg) [768](screenshots/advertiser_advertiser_create-campaign_768.jpg) [1280](screenshots/advertiser_advertiser_create-campaign_1280.jpg) [1440](screenshots/advertiser_advertiser_create-campaign_1440.jpg) |
| advertiser | `/advertiser/creatives` | Creatives | 0 | 0 | 5 | 1082px | — | [390](screenshots/advertiser_advertiser_creatives_390.jpg) [768](screenshots/advertiser_advertiser_creatives_768.jpg) [1280](screenshots/advertiser_advertiser_creatives_1280.jpg) [1440](screenshots/advertiser_advertiser_creatives_1440.jpg) |
| advertiser | `/advertiser/locations` | Locations | 0 | 0 | 6 | 1018px | — | [390](screenshots/advertiser_advertiser_locations_390.jpg) [768](screenshots/advertiser_advertiser_locations_768.jpg) [1280](screenshots/advertiser_advertiser_locations_1280.jpg) [1440](screenshots/advertiser_advertiser_locations_1440.jpg) |
| advertiser | `/advertiser/notifications` | Notifications | 0 | 0 | 6 | 921px | — | [390](screenshots/advertiser_advertiser_notifications_390.jpg) [768](screenshots/advertiser_advertiser_notifications_768.jpg) [1280](screenshots/advertiser_advertiser_notifications_1280.jpg) [1440](screenshots/advertiser_advertiser_notifications_1440.jpg) |
| advertiser | `/advertiser/reports` | Reports | 0 | 0 | 5 | 1528px | — | [390](screenshots/advertiser_advertiser_reports_390.jpg) [768](screenshots/advertiser_advertiser_reports_768.jpg) [1280](screenshots/advertiser_advertiser_reports_1280.jpg) [1440](screenshots/advertiser_advertiser_reports_1440.jpg) |
| advertiser | `/advertiser/settings` | Settings | 0 | 0 | 5 | 1392px | — | [390](screenshots/advertiser_advertiser_settings_390.jpg) [768](screenshots/advertiser_advertiser_settings_768.jpg) [1280](screenshots/advertiser_advertiser_settings_1280.jpg) [1440](screenshots/advertiser_advertiser_settings_1440.jpg) |
| advertiser | `/advertiser/support` | Support | 0 | 0 | 6 | 1000px | — | [390](screenshots/advertiser_advertiser_support_390.jpg) [768](screenshots/advertiser_advertiser_support_768.jpg) [1280](screenshots/advertiser_advertiser_support_1280.jpg) [1440](screenshots/advertiser_advertiser_support_1440.jpg) |
| driver | `/driver` | Overview | 0 | 0 | 17 | 1047px | — | [390](screenshots/driver_driver_390.jpg) [768](screenshots/driver_driver_768.jpg) [1280](screenshots/driver_driver_1280.jpg) [1440](screenshots/driver_driver_1440.jpg) |
| driver | `/driver/assigned-ads` | Assigned Ads | 0 | 0 | 17 | 921px | 404 GET /api/backend/driver/assignments | [390](screenshots/driver_driver_assigned-ads_390.jpg) [768](screenshots/driver_driver_assigned-ads_768.jpg) [1280](screenshots/driver_driver_assigned-ads_1280.jpg) [1440](screenshots/driver_driver_assigned-ads_1440.jpg) |
| driver | `/driver/campaigns` | Campaigns | 0 | 0 | 17 | 921px | 404 GET /api/backend/driver/assignments | [390](screenshots/driver_driver_campaigns_390.jpg) [768](screenshots/driver_driver_campaigns_768.jpg) [1280](screenshots/driver_driver_campaigns_1280.jpg) [1440](screenshots/driver_driver_campaigns_1440.jpg) |
| driver | `/driver/delivery` | Delivery | 0 | 0 | 17 | 921px | 404 GET /api/backend/driver/assignments | [390](screenshots/driver_driver_delivery_390.jpg) [768](screenshots/driver_driver_delivery_768.jpg) [1280](screenshots/driver_driver_delivery_1280.jpg) [1440](screenshots/driver_driver_delivery_1440.jpg) |
| driver | `/driver/earnings` | Earnings | 0 | 0 | 17 | 921px | — | [390](screenshots/driver_driver_earnings_390.jpg) [768](screenshots/driver_driver_earnings_768.jpg) [1280](screenshots/driver_driver_earnings_1280.jpg) [1440](screenshots/driver_driver_earnings_1440.jpg) |
| driver | `/driver/maintenance` | Maintenance | 0 | 0 | 17 | 921px | — | [390](screenshots/driver_driver_maintenance_390.jpg) [768](screenshots/driver_driver_maintenance_768.jpg) [1280](screenshots/driver_driver_maintenance_1280.jpg) [1440](screenshots/driver_driver_maintenance_1440.jpg) |
| driver | `/driver/notifications` | Notifications | 0 | 0 | 17 | 921px | — | [390](screenshots/driver_driver_notifications_390.jpg) [768](screenshots/driver_driver_notifications_768.jpg) [1280](screenshots/driver_driver_notifications_1280.jpg) [1440](screenshots/driver_driver_notifications_1440.jpg) |
| driver | `/driver/onboarding` | Onboarding | 0 | 0 | 17 | 921px | — | [390](screenshots/driver_driver_onboarding_390.jpg) [768](screenshots/driver_driver_onboarding_768.jpg) [1280](screenshots/driver_driver_onboarding_1280.jpg) [1440](screenshots/driver_driver_onboarding_1440.jpg) |
| driver | `/driver/payouts` | Payouts | 0 | 0 | 17 | 921px | — | [390](screenshots/driver_driver_payouts_390.jpg) [768](screenshots/driver_driver_payouts_768.jpg) [1280](screenshots/driver_driver_payouts_1280.jpg) [1440](screenshots/driver_driver_payouts_1440.jpg) |
| driver | `/driver/profile` | Profile | 0 | 0 | 17 | 1047px | — | [390](screenshots/driver_driver_profile_390.jpg) [768](screenshots/driver_driver_profile_768.jpg) [1280](screenshots/driver_driver_profile_1280.jpg) [1440](screenshots/driver_driver_profile_1440.jpg) |
| driver | `/driver/support` | Support | 0 | 0 | 20 | 934px | — | [390](screenshots/driver_driver_support_390.jpg) [768](screenshots/driver_driver_support_768.jpg) [1280](screenshots/driver_driver_support_1280.jpg) [1440](screenshots/driver_driver_support_1440.jpg) |
| driver | `/driver/trips` | Trips | 0 | 0 | 17 | 921px | — | [390](screenshots/driver_driver_trips_390.jpg) [768](screenshots/driver_driver_trips_768.jpg) [1280](screenshots/driver_driver_trips_1280.jpg) [1440](screenshots/driver_driver_trips_1440.jpg) |
| driver | `/driver/vehicle` | Vehicle | 0 | 0 | 17 | 921px | — | [390](screenshots/driver_driver_vehicle_390.jpg) [768](screenshots/driver_driver_vehicle_768.jpg) [1280](screenshots/driver_driver_vehicle_1280.jpg) [1440](screenshots/driver_driver_vehicle_1440.jpg) |
| driver | `/driver/verification` | Verification | 0 | 0 | 17 | 921px | — | [390](screenshots/driver_driver_verification_390.jpg) [768](screenshots/driver_driver_verification_768.jpg) [1280](screenshots/driver_driver_verification_1280.jpg) [1440](screenshots/driver_driver_verification_1440.jpg) |
| admin | `/admin` | Dashboard | 0 | 0 | 4 | 2346px | — | [390](screenshots/admin_admin_390.jpg) [768](screenshots/admin_admin_768.jpg) [1280](screenshots/admin_admin_1280.jpg) [1440](screenshots/admin_admin_1440.jpg) |
| admin | `/admin/ad-formats` | Ad Formats | color-contrast ×6 | 0 | 3 | 1174px | — | [390](screenshots/admin_admin_ad-formats_390.jpg) [768](screenshots/admin_admin_ad-formats_768.jpg) [1280](screenshots/admin_admin_ad-formats_1280.jpg) [1440](screenshots/admin_admin_ad-formats_1440.jpg) |
| admin | `/admin/advertisers` | Advertisers | color-contrast ×1 | 0 | 9 | 921px | — | [390](screenshots/admin_admin_advertisers_390.jpg) [768](screenshots/admin_admin_advertisers_768.jpg) [1280](screenshots/admin_admin_advertisers_1280.jpg) [1440](screenshots/admin_admin_advertisers_1440.jpg) |
| admin | `/admin/analytics` | Reports & Analytics | 0 | 0 | 6 | 2670px | — | [390](screenshots/admin_admin_analytics_390.jpg) [768](screenshots/admin_admin_analytics_768.jpg) [1280](screenshots/admin_admin_analytics_1280.jpg) [1440](screenshots/admin_admin_analytics_1440.jpg) |
| admin | `/admin/approvals` | Approvals | 0 | 0 | 9 | 921px | — | [390](screenshots/admin_admin_approvals_390.jpg) [768](screenshots/admin_admin_approvals_768.jpg) [1280](screenshots/admin_admin_approvals_1280.jpg) [1440](screenshots/admin_admin_approvals_1440.jpg) |
| admin | `/admin/audit` | Audit History | 0 | 0 | 6 | 1377px | — | [390](screenshots/admin_admin_audit_390.jpg) [768](screenshots/admin_admin_audit_768.jpg) [1280](screenshots/admin_admin_audit_1280.jpg) [1440](screenshots/admin_admin_audit_1440.jpg) |
| admin | `/admin/bookings` | Bookings | 0 | 0 | 5 | 921px | — | [390](screenshots/admin_admin_bookings_390.jpg) [768](screenshots/admin_admin_bookings_768.jpg) [1280](screenshots/admin_admin_bookings_1280.jpg) [1440](screenshots/admin_admin_bookings_1440.jpg) |
| admin | `/admin/campaigns` | Campaigns | 0 | 0 | 6 | 921px | — | [390](screenshots/admin_admin_campaigns_390.jpg) [768](screenshots/admin_admin_campaigns_768.jpg) [1280](screenshots/admin_admin_campaigns_1280.jpg) [1440](screenshots/admin_admin_campaigns_1440.jpg) |
| admin | `/admin/drivers` | Driver Partners | 0 | 0 | 5 | 921px | — | [390](screenshots/admin_admin_drivers_390.jpg) [768](screenshots/admin_admin_drivers_768.jpg) [1280](screenshots/admin_admin_drivers_1280.jpg) [1440](screenshots/admin_admin_drivers_1440.jpg) |
| admin | `/admin/locations` | Locations & Zones | 0 | 0 | 13 | 1466px | — | [390](screenshots/admin_admin_locations_390.jpg) [768](screenshots/admin_admin_locations_768.jpg) [1280](screenshots/admin_admin_locations_1280.jpg) [1440](screenshots/admin_admin_locations_1440.jpg) |
| admin | `/admin/notifications` | Notifications | 0 | 0 | 5 | 921px | — | [390](screenshots/admin_admin_notifications_390.jpg) [768](screenshots/admin_admin_notifications_768.jpg) [1280](screenshots/admin_admin_notifications_1280.jpg) [1440](screenshots/admin_admin_notifications_1440.jpg) |
| admin | `/admin/payments` | Payments & Refunds | 0 | 0 | 4 | 921px | — | [390](screenshots/admin_admin_payments_390.jpg) [768](screenshots/admin_admin_payments_768.jpg) [1280](screenshots/admin_admin_payments_1280.jpg) [1440](screenshots/admin_admin_payments_1440.jpg) |
| admin | `/admin/pricing` | Pricing & Commercial | 0 | 0 | 11 | 1456px | — | [390](screenshots/admin_admin_pricing_390.jpg) [768](screenshots/admin_admin_pricing_768.jpg) [1280](screenshots/admin_admin_pricing_1280.jpg) [1440](screenshots/admin_admin_pricing_1440.jpg) |
| admin | `/admin/screens` | Screens & Devices | 0 | 0 | 4 | 921px | — | [390](screenshots/admin_admin_screens_390.jpg) [768](screenshots/admin_admin_screens_768.jpg) [1280](screenshots/admin_admin_screens_1280.jpg) [1440](screenshots/admin_admin_screens_1440.jpg) |
| admin | `/admin/settings` | Security & Settings | 0 | 0 | 3 | 921px | — | [390](screenshots/admin_admin_settings_390.jpg) [768](screenshots/admin_admin_settings_768.jpg) [1280](screenshots/admin_admin_settings_1280.jpg) [1440](screenshots/admin_admin_settings_1440.jpg) |
| admin | `/admin/settlements` | Driver Settlements | 0 | 0 | 3 | 921px | — | [390](screenshots/admin_admin_settlements_390.jpg) [768](screenshots/admin_admin_settlements_768.jpg) [1280](screenshots/admin_admin_settlements_1280.jpg) [1440](screenshots/admin_admin_settlements_1440.jpg) |
| admin | `/admin/support` | Support & Disputes | 0 | 0 | 5 | 921px | — | [390](screenshots/admin_admin_support_390.jpg) [768](screenshots/admin_admin_support_768.jpg) [1280](screenshots/admin_admin_support_1280.jpg) [1440](screenshots/admin_admin_support_1440.jpg) |
| admin | `/admin/users` | Users & Roles | color-contrast ×3 | 0 | 11 | 1230px | — | [390](screenshots/admin_admin_users_390.jpg) [768](screenshots/admin_admin_users_768.jpg) [1280](screenshots/admin_admin_users_1280.jpg) [1440](screenshots/admin_admin_users_1440.jpg) |

## Where each finding gets fixed

| Milestone | Findings |
|---|---|
| M2 design system | H4, H7, MD8, L1, L3 |
| M3 portal shell | H1 (proposal only), MD1, MD2, MD3, L4 |
| M4 public site | H5, H6, MD7, MD9, L2 |
| M5 advertiser | H2, MD4, MD6 |
| M6 driver | C1 (honest unavailable state), C2, MD5 |
| M7 admin | H3, MD4 |
| M8 dead code | MD10 and the unreachable legacy features (owner approval first) |
| Each milestone | L5: format only the files touched |
