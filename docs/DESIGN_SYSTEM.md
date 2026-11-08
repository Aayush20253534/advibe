# BlinkMyAd design system

The public site, authentication screens and all three API portals share this identity. `/design-system` is an internal, noindex component reference.

## Direction

A confident outdoor advertising company: strong Manrope headlines, editorial image-led sections, compact actions, purposeful blue accents and selected charcoal sections. Public pages introduce the format and campaign journey; portal pages prioritize dense, readable working data. Avoid glow, gradients, excessive rounding, invented metrics and repetitive oversized cards.

## Colour tokens

Defined in `src/app/globals.css`.

| Token | Hex | Use |
|---|---|---|
| ink | #171A20 | Primary text and sidebar |
| ink-muted | #555E6C | Supporting text |
| ink-subtle | #626C7A | Secondary metadata |
| night | #15181E | Dark public sections and footer |
| signal | #1958F5 | Primary actions and active states, with white text |
| signal-hover | #1247CB | Hovered primary actions |
| paper | #F6F7F9 | Workspace background |
| surface | #FFFFFF | Forms, cards and tables |
| line | #E0E3E9 | Dividers |
| line-strong | #7C8594 | Discernible form borders |

Semantic success, warning and danger colours remain independent of branding. Legacy `beacon` and `brand-orange` aliases resolve to signal; controls on them must use white text. Purple is limited to small accents in the artwork.

## Typography and density

Manrope headings are served by `next/font`; body and controls use the native UI stack. Public display headings scale from 36–82px. Portal headings are 24–28px; body copy 14–16px; compact auxiliary public labels 10–12px. Form inputs keep 16px text on mobile to avoid browser zoom. Primary inputs/actions are at least 44px high. Cards use 6–8px corners and 16px padding, with restrained borders rather than heavy shadows.

## Composition

- Public: white navigation, large original vehicle renders, interactive format explorer, charcoal campaign explainer, clearly labelled Prayagraj route illustration and blue closing CTA.
- Authentication: charcoal artwork panel and uncluttered white form; no fixed-height form clipping or stretched images. Verification identifiers are carried by the link instead of exposed as a user-entered field.
- Live portals: `src/components/portal/portal-shell.tsx`, 240px charcoal navigation, compact header, neutral content and shared controls. The similarly named layout shell is legacy demo UI.
- Contact: a protected enquiry form when configured; otherwise honest availability and account/help links. No public contact address or telephone is invented.

## Components (`src/components/ui`)

| Component | Notes |
|---|---|
| `Button` | `primary` (signal), `brand` (signal), `secondary`, `outline`, `ghost`, `destructive`, `link`; sizes `sm`, `md` (44px), `lg`, `icon`; `loading` |
| `Input`, `DateInput`, `Textarea`, `Select`, `Checkbox`, `Switch` | 44px controls, 3:1 borders, visible focus, error state via `aria-invalid` |
| `Field` | Label, hint and error. Wires `id`, `aria-describedby`, `aria-invalid` and `required` onto its child automatically |
| `Badge`, `StatusBadge` | Status is always a text label plus colour, never colour alone. Tones: neutral, info, success, warning, danger, live |
| `Alert` | info, success, warning, danger. Danger uses `role="alert"`, others `role="status"` |
| `Card`, `Metric` | Bordered, no shadow by default. `Metric` uses tabular numerals |
| `DataTable` | Sorting (`aria-sort`), filter box, pagination, right-aligned numeric columns, `dense` mode for admin, scrollable labelled region |
| `Dialog`, `Drawer` | Radix. Focus trap, Escape to close, focus returns to the opener |
| `Popover`, `Tooltip` | Radix. Tooltips hold short supplementary labels only |
| `Tabs` | Segmented choice (pressed-button group) for filters |
| `TabsRoot`, `TabsList`, `TabsTrigger`, `TabsContent` | Real tab panels (Radix) |
| `Skeleton`, `SkeletonList` | Pulse only when motion is allowed; `SkeletonList` announces loading |
| `EmptyState`, `ErrorState`, `SuccessState`, `PermissionDeniedState` | Each says what happened and offers the next step |
| `PageHeader`, `Breadcrumbs` | One `h1` per page, actions on the right, current crumb marked `aria-current="page"` |

## Motion

Public pages use a one-time image reveal, short scroll entrances and user-controlled format/campaign explanations. Content remains available without JavaScript and reduced-motion visitors see the static composition. Portals use only short control/overlay transitions; there is no autoplay dashboard motion.

## Copy

Plain, active and specific. Buttons say exactly what happens ("Submit for review"). Errors say what went wrong and how to fix it. Empty states invite the next action.

## Checks

- `BASE_URL=http://127.0.0.1:3000 npm run test:visual` against a running production build compares `/design-system` at 390 and 1440px with `tests/visual/baselines`, runs axe (WCAG 2.2 AA) on the page and with the dialog and drawer open, checks focus returns after closing the dialog, and fails on horizontal overflow or console errors. Add `-- --update` to rewrite baselines after an intended visual change. Baselines were captured on Linux with Playwright's Chromium; font rendering differs on other platforms. This check is not part of CI.
- Prettier (`.prettierrc.json`) formats only files touched by the redesign: `npx prettier --write <files>`.

## Current engineering additions

`src/config/brand.ts` separates the BlinkMyAd product name from approved legacy artwork and internal `ADVIBE_*` identifiers. `BrandLogo` resolves the public asset from that configuration. Existing BMA auth artwork remains unchanged; this does not resolve the owner's artwork approval decision.

`CursorPagination` provides keyboard-accessible First/Next controls and last-page feedback. Callers must pass whether a previous cursor exists so users can return from the final page. Existing color, type, spacing, skeleton, dialog, table and chart systems are retained.

The obsolete generic `ApiSection`, its dynamic data dumping and duplicate forms were removed. Dedicated advertiser, driver and admin screens remain the live routes. Security assertions now point to those active implementations; no security tests were deleted.
