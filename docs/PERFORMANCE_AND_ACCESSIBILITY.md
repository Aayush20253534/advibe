# Performance, SEO and accessibility evidence

## Implemented

Public routes now use per-page canonical/OG metadata with an explicit credential-free HTTPS origin. Indexing requires the release flag; robots, sitemap and page metadata agree. Pending legal pages and private/auth routes remain non-indexable. Static WebSite JSON-LD contains only the configured public origin/name and escapes `<`; it makes no business-address, review or rating claims.

The hero uses Next.js optimized picture sources to choose desktop vs mobile/reduced-motion artwork, avoiding two unconditional priority images. The production layout no longer mounts a development-only provider-status fetch/banner. Maps wait for visitor interaction; catalogue requests and portals retain cursor metadata. Existing next/font local delivery, responsive images, scroll reveals and reduced-motion behavior are preserved. Reference: [Next.js art direction](https://nextjs.org/docs/app/api-reference/components/image#art-direction).

Keyboard support includes existing skip links, mobile focus trapping/Escape restoration and newly keyboard-selectable admin rows. Shared final-page controls retain a usable return to the first page. Orange timeline numerals use dark text. Source/runtime assertions verify these contracts; they do not replace screen-reader and browser inspection.

## Actual build measurements

Linux x64, Node 24.22.1, Next 16.4.2 production build. No backend or provider connected. Sizes below are generated HTML and the sum of individually gzipped JS files directly referenced by each page, excluding images, CSS, fonts and later dynamic imports. They are **not** measured browser transfer sizes or loaded execution costs. Exact bytes: `qa/build-size.json`.

| Route | HTML gzip | Referenced JS gzip | Script files |
| --- | ---: | ---: | ---: |
| `/` | 18,447 B | 285,907 B | 14 |
| `/locations` | 6,424 B | 249,322 B | 13 |
| `/login` | 4,504 B | 238,947 B | 13 |
| `/advertiser` | 2,920 B | 251,075 B | 13 |
| `/driver` | 2,890 B | 248,483 B | 13 |
| `/admin` | 2,889 B | 248,669 B | 13 |

Production build and 154 frontend assertions/runtime tests pass at the phase-10 checkpoint. Local query/transaction correctness is tested, but representative traffic latency, memory peaks and production pool usage have not been measured.

## Blocked browser evidence

The managed preview launcher appends `--host 127.0.0.1 --port 4173 --strictPort` to `next dev`; Next rejects the unsupported host/strictPort arguments. The preview is stopped. No browser screenshot, visual regression, viewport review, screen-reader run or Lighthouse score was produced. Application scripts were not changed to disguise this preview-infrastructure problem.

| Target | Actual result |
| --- | --- |
| Mobile Lighthouse performance ≥90 | Not measured |
| Accessibility ≥95 | Not measured |
| Best Practices ≥95 | Not measured |
| LCP ≤2.5 s | Not measured |
| CLS ≤0.1 | Not measured |
| INP ≤200 ms | Not measured; field or representative interaction evidence needed |

Before staging admission, repair the preview adapter or run the committed browser checks on an approved staging host. Inspect 360/390 px mobile, 768 px tablet, 1280/1440 px desktop; keyboard-only navigation, zoom 200%, contrast, reduced motion, slow/failed API responses, all auth states, final pagination pages, optional map loading and every privileged confirmation. Run Chromium, Firefox and WebKit where available. Measure cold/warm mobile performance over repeated samples and record the environment; do not turn these targets into claimed scores.
