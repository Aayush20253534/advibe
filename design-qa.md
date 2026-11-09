# Ad Formats implementation QA

final result: passed

## Findings

No actionable P0/P1/P2 issues remain in the tested states.

- **Accepted asset recreation:** the user authorized generating the required images. The eight new raster assets reproduce the reference's vehicle subjects, placement locations, daylight city setting, white vehicles and cobalt branding. They are recreated compositions, not the original reference pixels. The existing official header/footer logo is unchanged.
- **Accepted product requirement:** the detail panel retains the existing advertiser-account link beneath Estimate cost. This adds a small amount of height compared with the reference and preserves the previously required action.
- **P3 — minor text wrapping and density differences:** the shared site typography is retained. At the tested desktop width, the selected format's full title wraps to two lines and the complete page is slightly taller than a uniformly scaled reference. No content is truncated or hidden. The additional height does not change the section order or catalogue composition.

## Source and rendered evidence

- Source visual truth: `docs/redesign/ad-formats-reference/reference.png`, copied from the user's supplied `111.png`.
- Source dimensions: **941 × 1672 image pixels**. Its original CSS viewport and export density are not supplied; it is treated as a proportional desktop visual target, not a claimed 1:1 CSS capture.
- Implementation: `/ad-formats` on the locally running production build.
- Browser: Chromium, light theme, signed out.
- Desktop CSS viewport: **1363 × 936**, device pixel ratio **1**. The page's measured content/scroll width is **1348**, including the browser's scrollbar allocation. The current desktop environment did not provide a 1440px viewport.
- Browser viewport screenshots: **1348 × 926 pixels** as returned by the browser capture API. The API trims part of the viewport/scrollbar; screenshots were not stretched to manufacture exact pixel matching.
- Default state: All formats; Auto rickshaw rear screen selected; FAQ rows collapsed.
- Actual implementation screenshots:
  - `docs/redesign/ad-formats-reference/desktop-top.png`
  - `docs/redesign/ad-formats-reference/desktop-middle.png`
  - `docs/redesign/ad-formats-reference/desktop-bottom.png`
- Full-view comparison: `docs/redesign/ad-formats-reference/comparison.jpg`. The reference and three implementation viewport captures are displayed together at equal display widths. The implementation captures are separate views, with overlap and a repeated sticky navbar, not a claimed continuous full-page screenshot.
- Focused comparisons, source above implementation in each file:
  - `docs/redesign/ad-formats-reference/hero-comparison.jpg`
  - `docs/redesign/ad-formats-reference/catalogue-comparison.jpg`
- Mobile evidence:
  - `docs/redesign/ad-formats-reference/mobile-top.png`
  - `docs/redesign/ad-formats-reference/mobile-details.png`

The browser's full-page screenshot path omitted the hero image despite the image being visible and loaded in ordinary viewport captures. A stitched version also duplicated the moving sticky detail panel. Neither defective capture was used as final fidelity evidence; the actual viewport captures above are authoritative.

## Comparison history

1. **P2 — hero horizontal overflow.** The initial rendered hero's intrinsic aspect-ratio sizing extended the document beyond the desktop viewport. Added an explicit `width: 100%` to `.bma-formats-hero`. Post-fix browser measurement: document scroll width 1348px, below the 1363px viewport; no horizontal clipping. Verified in `desktop-top.png` and mobile browser states.
2. **P2 — catalogue/footer too tall relative to the supplied compact reference.** The first comparison showed excess card spacing, large inherited footer list margins and a taller closing section. Tightened desktop card copy/spec spacing, secondary-row image proportions, guidance copy, FAQ rows and CTA padding; removed inherited footer list/brand margins only on this route. Rebuilt and recaptured at the same desktop viewport. Post-fix evidence: `comparison.jpg`, `catalogue-comparison.jpg`, `desktop-middle.png`, and `desktop-bottom.png`.
3. **Final visual pass.** Reopened the combined full-view and focused comparisons after those changes. The hero/fleet split, filter row, three-column catalogue, right detail panel, notice, four guidance items, FAQ, wave CTA and shared footer follow the source. Remaining differences are the accepted/P3 items above.

## Required fidelity surfaces

| Surface | Result and evidence |
| --- | --- |
| Fonts and typography | Existing locally served Manrope headings and system UI body fonts retained. Strong two-line hero hierarchy, cobalt emphasis, compact bold card titles and legible spec text match the reference's hierarchy. No truncation observed. Full selected title can wrap at the tested width; accepted P3. Focused hero/catalogue comparisons inspected. |
| Spacing and layout | Reference section order, page gutters, hero ratio, 3×2 cards plus sidebar, rounded controls, thin borders and compact lower sections reproduced. Detail panel is sticky on desktop and stacked on smaller screens. Overflow fixed; post-fix native screenshots inspected. |
| Colors and tokens | Cobalt `#073DFB`, white surfaces, pale-blue guides/notice, dark ink, and navy closing/footer treatment. Selected filters/cards use the same cobalt. Footer and nav adjustments are scoped to `[data-page="ad-formats"]`. |
| Images and assets | Eight generated raster assets, optimized to WebP, total approximately 1MB. All page images loaded with positive natural dimensions. Vehicle/screens show the correct placement; helmet is a printed wrap. No custom SVG or CSS vehicle illustrations. Lucide supplies consistent interface icons; actual brand logo reused. |
| Copy and product content | All six original format names, descriptions, example specifications and use cases retained. Hardware and creative-review statements retained. Existing three FAQ answers and four guidance explanations retained. Reference-specific hero/section copy implemented. Illustrative-image and campaign-confirmation disclosure visible. No new dimensions, prices or installation availability invented. |

## Browser interaction verification

- All formats returns six items; Bike one; Auto rickshaw two; Car two; Other one.
- Filtering selects a matching format when the previous selection is outside the new category.
- View details updates the selected card, title, description, image, specifications and pricing query parameter.
- Confirmed selected state for default auto rear, bike, car interior, car rear and helmet.
- Helmet uses “Example placement” / “Custom printed wrap” and retains the statement that it is not a screen and is not scheduled through the platform.
- Estimate cost navigated to `/pricing?format=car_rear` and the actual pricing page loaded.
- Create an advertiser account navigated to `/signup?role=advertiser` and the actual Create account page loaded. No form was submitted.
- All three FAQ rows expanded to show the existing answers and collapsed again.
- Explore ad formats scrolls to the catalogue.
- Public mobile menu opens and closes with Escape.
- At narrow widths, View details focuses `selected-format-panel` and scrolls it into view; bike and car-rear selection verified.
- Browser page-console inspection returned no application errors or warnings. Browser-extension messages were excluded as unrelated to the application.

## Responsive and accessibility verification

Desktop and narrow responsive states were inspected through the real browser. Narrow CSS widths were **454px at 300% browser zoom** and **340px at 400% browser zoom**; this is CSS reflow/zoom coverage, not an emulated physical mobile device. At 340px, the CSS viewport was 340 × 234 with device pixel ratio 4; the screenshot API returned 337 × 231 normalized pixels. No horizontal overflow was observed at either tested narrow width.

Native buttons and links, accessible pressed/selected states, a live selection/count announcement, descriptive illustrative-image alt text, labelled regions, keyboard focus styles, and reduced-motion-aware detail scrolling are present. Mobile action controls use at least 44px heights. The selected panel remains reachable without removing any content.

Coverage limits: the supplied reference contains no mobile composition or open FAQ state. Mobile layout is a responsive adaptation. Physical-device touch testing and a separate 1440px browser capture were not performed. Backend account creation and campaign submission were outside this presentation change and were not exercised.

## Code verification

- `npm run check`: passed — ESLint, TypeScript, **155 tests passed / 0 failed**, API contract check, production build.
- `npm run build`: passed again after final visual refinements and the Next Image preload adjustment.
- `git diff --check`: passed.
- Existing shared navigation, footer links, format data and backend contracts are preserved. No new dependencies.

## Implementation checklist

- [x] Reference layout and all sections implemented.
- [x] Eight optimized visual assets installed.
- [x] Six formats, filters and selected details preserved.
- [x] Pricing and advertiser signup routes verified.
- [x] Printed helmet distinction and illustrative-placement notice preserved.
- [x] Desktop and narrow responsive states inspected in browser.
- [x] Full-view and focused source/implementation comparisons reviewed.
- [x] Build, tests, lint, types and contracts passed.

final result: passed
