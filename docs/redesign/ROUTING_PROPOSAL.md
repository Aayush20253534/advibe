# Proposal: render real portal pages instead of `void children`

Status: **approved by the owner and implemented** (commit after M4).

## What happens today

Each portal layout ignores its page and renders one client component that picks a screen from the URL:

```tsx
// src/app/(portals)/advertiser/layout.tsx
export default function AdvertiserLayout({ children }) {
  void children;
  return <AdvertiserPortal />;
}
```

- The 47 `page.tsx` files under `src/app/(portals)` never render. Most still import unreachable demo-era screens (`src/features/advertiser`, `driver`, `admin`).
- Every screen of a portal ships in one JavaScript bundle, because the switch statement imports them all.
- Per-page `metadata`, `loading.tsx` and `error.tsx` cannot work. The browser tab title is the same on every portal page.
- URLs already work, and back/forward works, because the switch reads `usePathname()`. This proposal is about structure, speed and maintainability, not broken links.

## Proposed structure

1. **The layout renders a frame around `children`.** The existing portal component keeps its name (`AdvertiserPortal`, `AdminPortal`, `ApiPortal`), session check, role check, tab-focus revalidation, sign-out and context provider, and renders `<PortalShell>{children}</PortalShell>` instead of the internal switch.

   ```tsx
   // src/app/(portals)/advertiser/layout.tsx (server component)
   export default function AdvertiserLayout({ children }: { children: React.ReactNode }) {
     return <AdvertiserPortal>{children}</AdvertiserPortal>;
   }
   ```

   App Router keeps a layout mounted while navigating between its pages, so the session is still checked once per visit, exactly as now.

2. **Each page renders its live screen.**

   ```tsx
   // src/app/(portals)/advertiser/campaigns/page.tsx
   export const metadata = { title: "My campaigns", robots: { index: false, follow: false } };
   export default function Page() {
     return <CampaignIndex />;
   }

   // src/app/(portals)/advertiser/campaigns/[id]/page.tsx
   export default async function Page({ params }: { params: Promise<{ id: string }> }) {
     return <CampaignDetail id={(await params).id} />;
   }
   ```

   The advertiser's business switch keeps remounting screens through a small wrapper that applies `key={activeBusinessId}`, as the switch does today.

3. **The driver portal's generic `ApiPortal` splits** into the frame (session and shell) and a per-section component used by each driver page. M6 then replaces those sections with purpose-built screens page by page.

4. **The `[section]` catch-all pages** call `notFound()`, so unknown portal URLs show the 404 page instead of "This section does not have an approved API workflow."

5. **Each portal gets `loading.tsx` and `error.tsx`** using `SkeletonList` and `ErrorState` from the design system.

## What stays exactly the same

- The session request (`/auth/session`), role checks, wrong-role and signed-out messages, tab-focus revalidation and sign-out request.
- Every API call, payload, CSRF token and idempotency key. Screens are moved, not rewritten.
- Every URL.

## Tests affected

| Test | Change needed |
|---|---|
| `tests/b4-admin-live-contract.test.mjs` asserts the layout contains `<AdminPortal />` (self-closing) | Assert `<AdminPortal>{children}</AdminPortal>` instead. The other assertions (no `PortalGate`, demo auth or `ApiPortal` in the layout) stay. |
| `tests/b22-api-integration.test.mjs` asserts the advertiser and admin layouts use the self-closing form | Correction to this proposal, which said no change was needed: the pattern now matches each portal wrapping `{children}`. The "no demo mode, no `PortalGate`, no `PortalShell` in layouts" assertion is unchanged. |
| `tests/b3-advertiser-live-contract.test.mjs` | No change: it checks the layout uses `AdvertiserPortal` and no demo code. |
| `tests/part22-*.test.mjs` "sidebar destinations are dedicated pages" | No change: still true, and now literally rendered. |
| `scripts/portal-shell-browser.mjs`, `b22-live-browser.mjs`, `b2-auth-browser.mjs` | No change expected; all must still pass. |

After this change the demo-era screens are no longer imported by any page. Deleting them stays in M8, with an exact file list for your approval.

## How it would be verified

- Full CI sequence, all 127+ tests in `tests/`.
- `npm run test:portal-shell`, `test:live-browser`, `test:auth-browser`.
- The 60-route, 4-width crawl against the real backend, compared with M3: identical access matrix and headings, no overflow, no new axe issues.
- Captured network requests per screen compared before and after (same endpoints, methods and payload shapes).
- Bundle sizes per portal route reported before and after.

## Size and risk

About 55 files: 3 layouts, 3 portal components, 47 pages, plus `loading.tsx` and `error.tsx` per portal. The main risk is a screen that relied on state held in the old portal component (the driver portal's cursor and selected record); those move into the driver section component. The change can be reverted with a single commit.

## Decision needed

Approve this before M5 (advertiser) so the advertiser redesign is built on real pages. If you'd rather keep the current pattern, M5–M7 still work; the portals just keep one bundle each and shared tab titles.

## Implementation results

- Layouts render `<AdvertiserPortal>`, `<AdminPortal>` and `<ApiPortal role="driver">` around `{children}`. Every portal `page.tsx` renders its live screen; the demo-era screens are no longer imported by any page. `BusinessScoped` keeps the "switching business reloads business screens" behaviour. Each portal has `loading.tsx` and `error.tsx`.
- Unknown sections show the not-found page. Because `loading.tsx` streams the page first, the HTTP status is 200 rather than 404; portal pages are `noindex`, so this has no search impact.
- **Network equivalence:** API requests (method, path and query) and page headings captured on all 43 portal pages as each role, against the real backend, before and after: **43 of 43 identical**.
- Access matrix, overflow, axe and page errors on the 60-route crawl: unchanged from M4.
- `test:portal-shell` 18/18, `b22-live-browser` 3/3, `b2-auth-browser` pass; all 127 tests in `tests/` pass.
- Browser tab titles now differ per page (for example "My campaigns | AdVibe").
- Bundle sizes per route were not measured: this Next.js build does not print them.
