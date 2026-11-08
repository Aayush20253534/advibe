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

## Measured browser and mobile lab evidence

[Actions run 42400468155](https://github.com/Aayush20253534/advibe/actions/runs/42400468155) passed all seven jobs on `eaf2211b8a5bed47f42593e0bcd1708e7f58b3cc`. Chromium, Firefox and WebKit checks cover home, locations and login at 390/768/1440 px, plus role/auth/portal workflows. All 45 saved axe reports have empty violation arrays. Representative screenshots were inspected; [visual QA](BROWSER_VISUAL_QA.md) records scope and limits.

Lighthouse 13.6.0 used Headless Chromium 141, Node 22.23.4 and the Playwright 1.56.1 Ubuntu container. Three samples per route ran against the local production server, with fresh browser storage and an already-running server. Mobile emulation: 412 × 823, device scale 1.75, simulated 150 ms RTT, 1,638.4 Kbps throughput and 4× CPU slowdown. These are CI lab measurements, not hosted/field results. Full settings, environment, warnings and samples are retained in [machine-readable evidence](qa/lighthouse-summary.json) and the delivered HTML/JSON reports.

| Median of three samples | Home `/` | Login `/login` | Target |
| --- | ---: | ---: | --- |
| Performance | 91 | 97 | ≥90: both meet |
| Accessibility | 100 | 100 | ≥95: both meet |
| Best Practices | 100 | 100 | ≥95: both meet |
| LCP | **3.45 s** | 2.49 s | ≤2.5 s: **home misses** |
| CLS | 0.000 | 0.041 | ≤0.1: both meet |
| TBT | 47 ms | 48 ms | Diagnostic; not INP |
| INP | Not measured | Not measured | ≤200 ms needs representative interactions/field evidence |

Home LCP samples were 3.32, 3.45 and 3.45 seconds; login samples were 2.79, 2.27 and 2.49 seconds. Login meets the median goal narrowly, and one sample misses it. Do not describe either page as a guaranteed Core Web Vitals pass.

## Measured remediation and remaining performance work

The first Lighthouse checkpoint (`f4d973e`) scored 91/100/100 on home and 97/100/100 on login, with median LCP 3.49/2.60 seconds. Its network report identified unused background route downloads. Public navigation, home CTAs and login/brand links now disable speculative route prefetching while retaining normal client-side navigation. In the comparable second sample, requests fell from 33 to 21 on home and 37 to 19 on login; transfer bytes fell from 440,702 to 389,526 and 393,863 to 287,527 respectively. Scores remained 91/97. These are observed sample comparisons, not a statistically controlled traffic benchmark. Reference: [Next.js Link prefetch](https://nextjs.org/docs/app/api-reference/components/link#prefetch).

**Home LCP remains an open performance issue.** The report identifies remaining unused initial JavaScript and image/render work. Further route/module splitting and deferred animation work should preserve visible server-rendered content, motion quality and existing interaction contracts, followed by repeated measurements. No image quality reduction, disabled animation suite or relaxed threshold was used to claim this goal passed.

Measurement errors fail CI; numerical goals remain separately reported. A green workflow does not convert the missed LCP target into a pass. Production query latency, representative concurrency, memory peaks and connection-pool load are unmeasured.

## Remaining acceptance

The local managed preview still rejects its injected Next CLI flags; remote CI supplied actual browser evidence. No screen-reader run, 200% zoom review or field INP measurement was performed. Check these plus 360/1280 px layouts, loaded catalogue/map interaction, real hosted-origin cookie/TLS behavior, all privileged confirmations and slow/failed provider responses on the approved staging environment before admission.
