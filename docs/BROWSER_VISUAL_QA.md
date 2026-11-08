# Browser and visual QA

Handoff updated: 8 November 2026. Test artifacts retain their recorded execution timestamps. Synthetic frontend acceptance only. Exact commit/run/artifact identities are in [CI verification](qa/ci-verification.json). No real account, payment, private document or physical device was used.

## Executed coverage

All four browser scripts pass in Chromium, Firefox and WebKit against a local production build inside GitHub Actions. The API responses are intercepted test fixtures; the separate backend job exercises real disposable PostgreSQL.

| Area | Executed checks |
| --- | --- |
| Role workflows | Advertiser campaign creation, driver notifications/earnings, administrator MFA and status mutation |
| Authentication | Registration, verification, recovery request, confirmed new password, reset-token URL scrubbing and subsequent login |
| Portal shell | 18 scenarios per engine: signed-out gate, wrong-role rejection, desktop navigation/breadcrumbs, idle expiry on focus, CSRF logout, mobile focus/Escape/navigation |
| Public pages | Home, locations and login at 390, 768 and 1440 px; one H1, horizontal overflow, uncaught errors, keyboard menu, reduced motion and unavailable catalogue |
| Captured axe reports | 15 reports per engine, 45 total; inspected violation arrays are empty. This does not certify all routes, interactive states or assistive technologies. |

Each engine saves nine public screenshots and six portal gate/home screenshots. The public capture scrolls through lazy images and requires successful image loading before the final full-page capture. The deliberately unavailable locations catalogue is a tested failure state, not a screenshot of live bookable inventory.

## Visual inspection

All 45 final captures from `eaf2211` match the prior green `fe0bac7` captures byte-for-byte. Representative screenshots were opened at their actual dimensions, including Chromium desktop home and mobile login, WebKit mobile home, Firefox tablet login, Firefox driver home, WebKit admin home, Chromium advertiser home and Chromium desktop locations. The final evidence archive preserves all 45 captures; sampling these images is not a claim of manually inspecting every route/state.

Observed results: mobile content stacks without horizontal overflow, key text and controls remain readable, loaded hero/format/section images appear, desktop cards and navigation align, portal states label unavailable operations, and the timeline stays readable throughout scrolling.

Corrections made after earlier runs:

- The location status badge now uses the darker blue token; its previous text/background ratio was approximately 4.2:1.
- Authentication gradient buttons use white-text ratios of approximately 5.74:1–6.12:1 and darken on hover.
- Timeline text no longer fades to low opacity during scroll.
- Full-page capture now loads and verifies lazy images before saving; earlier captures contained unloaded image areas.
- Stale password/MFA/recovery locators and Firefox container home ownership were corrected. Assertions, role checks and accessibility thresholds were not disabled.

## Remaining acceptance

The public/portal AdVibe artwork and authentication BMA artwork are inconsistent. Existing approved assets remain intact pending the official BlinkMyAd asset decision; helmet-format imagery also needs confirmation.

Manual screen-reader operation, 200% zoom, 360 px and 1280 px layouts, full loaded catalogue/map interaction, every finance confirmation, real secure cookies across hosted origins, actual sender/provider failures and physical mobile devices are not covered by this evidence. Old pixel baselines were not automatically accepted or relabelled as current visual-regression proof.

GitHub artifacts expire after seven days. The delivered evidence archive preserves the reviewed browser captures and Lighthouse HTML/JSON reports with a manifest. No production release decision follows from screenshot or axe success.
