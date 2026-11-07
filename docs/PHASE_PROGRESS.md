# Phase progress

Branch: `work/blinkmyad-production-readiness`. Baseline: `d2ac1f3`. Date: 7 November 2026 (India).

| Phase | Status | Evidence / remaining work |
| --- | --- | --- |
| 0 Audit | Complete | Source inventory, initial 136/138 frontend tests, route inventory 1/1; five audit documents committed |
| 1 Foundation | Implemented and locally checked | Lockfiles + npm ci, environment repairs, reset token/lint fix, client regressions 5/5, all frontend tests 143/143, lint/types/build pass. Browser blocked by preview CLI injecting unsupported Next.js flags. |
| 2 Design system | Implemented; browser verification blocked | Preserved tokens/artwork, brand config, shared cursor controls, removed unreachable generic portal; lint/types/build and 30 integration checks pass |
| 3 Public experience | Implemented; browser verification blocked | BlinkMyAd copy, preserved artwork, readable pre-hydration scroll sections, timeline contrast, public error recovery; lint/types/build and 143 tests pass |
| 4 Authentication | Implemented; browser/provider verification blocked | Auth/security database suites pass; server-issued idle expiry clears all three portals; sign-out errors visible; lint/types/build tracked in final QA |
| 5 Advertiser | Implemented; browser/provider verification blocked | Campaign/creative/pricing/reservation/payment DB suites pass with synthetic adapters; final cursor page now retains First page; frontend checks pass |
| 6 Driver | Implemented; browser/provider verification blocked | Added cursor navigation for vehicles/payouts/maintenance/notifications/support; earnings copy requires reviewed evidence; legal/storage gates preserved; frontend checks pass |
| 7 Administration | Implemented; browser verification blocked | Admin final-page navigation and keyboard selection repaired; 7 client/component regressions and admin contracts pass; support/admin/release DB suites, frontend lint/types/build, backend build/smoke and migration reapply pass |
| 8 Integrations | Implemented within available credentials; provider verification blocked | Optional on-demand published-area maps + public pagination; ad-format cursor regression fixed; map tests, frontend lint/types/build and full fresh PostgreSQL backend check pass; provider matrix documents unavailable live seams |
| 9 Security | Implemented and locally checked; independent review pending | Bounded relay/cookie regressions, baseline headers, tooling advisory remediation, SHA-pinned Actions; npm audit 0/0 findings; 152 frontend checks and complete fresh PostgreSQL backend check pass |
| 10 Performance/SEO/accessibility | Implemented and build-measured; browser metrics blocked | Canonical/indexing regressions, OG/WebSite metadata, responsive hero sources, production-only request reduction; lint/types/build and 154 frontend checks pass; bundle figures recorded, no Lighthouse claim |
| 11 QA | Local verification complete; browser/provider acceptance blocked | 154 frontend + 222 backend tests pass with zero skips; full lint/types/build/contracts, audit and synthetic encrypted restore pass. CI now discovers all tests and configures three browsers; execution still unverified. |
| 12 Release preparation | Documentation and review handoff prepared; deployment blocked | Cost/environment/recovery/launch reports complete; no B23 approval flags or paid/live operations enabled; branch/PR publication and CI status recorded at handoff |

External blockers are listed in `KNOWN_BLOCKERS.md`. Pending work is not completion. This file is the resumption checkpoint; no work continues automatically after the active session ends.

## PR verification follow-up

Draft PR #10 is published. On commit `3522fb1`, GitHub Actions passed frontend verification, full backend verification and the encrypted restore drill. Browser execution found ambiguous legacy password locators in Chromium/WebKit and a Firefox container home-ownership mismatch. Exact password labels and ephemeral home ownership are corrected without changing application authentication. Every browser suite now runs even when another fails, while the aggregate job still fails; screenshots and axe details are retained for diagnosis. Browser acceptance remains pending the rerun.

The second CI run (`43d1b24`) passed all 18 portal-shell scenarios in each of Chromium, Firefox and WebKit. It exposed stale MFA/recovery wording and an insufficient-contrast location badge (4.2:1 on its pale background). The tests now follow the current recovery confirmation fields and assert token scrubbing; the badge uses the darker existing blue. Timeline text no longer fades with scroll. Public capture scrolls through the page and checks loaded images before saving full-page screenshots. Complete browser acceptance still requires the next run.

Screenshot review also identified overly light authentication gradients. Login/signup/recovery buttons now use blue stops with 5.74:1–6.12:1 white-text contrast and darken on hover. Full local checks are rerun for these UI changes; browser thresholds remain unchanged.

With remote browser execution available, a pinned development-only Lighthouse CLI now records three mobile samples for home and login in Chromium CI. Reports retain the environment, scores, LCP/CLS/TBT and unmet targets; navigation-only runs do not claim INP or hosted performance. Measurement failures fail CI; numerical targets remain explicit release-review goals rather than fabricated passes.

The complete seven-job runs on `fe0bac7` and `f4d973e` passed. The latter measured median mobile Lighthouse scores of 91/100/100 (home) and 97/100/100 (login), but LCP was 3.49 s and 2.60 s, above the 2.5 s goal. Reports showed unused background route downloads; public navigation, home CTAs and login/brand links now defer route prefetching until navigation. Client-side navigation remains intact. This change requires a new browser/performance run; it does not waive the LCP target.
