# AdVibe design system

Live reference: `/design-system` (internal, `noindex`, disallowed in `robots.ts`, not linked from the public navigation or footer).

## Direction

Transit wayfinding and road signage: quiet, precise and disciplined. Boldness is spent in one place, the "route line" motif (homepage hero, campaign step rail, driver "today" status line). Everything else stays calm.

Avoid gradient washes, glassmorphism, glows, identical shadowed card grids, decorative entrance animations, "→" on every link, all-caps eyebrow labels above every heading, single coloured words in headlines and meta strings joined with middle dots.

## Colour tokens

Defined once in `src/app/globals.css` and used through Tailwind utilities (`bg-signal`, `text-ink-muted`, `border-line`, `bg-success-bg` …). Do not add hard-coded hex values in components.

| Token | Hex | Use |
|---|---|---|
| `ink` | #041B3D | Text, sidebar, dark surfaces |
| `ink-muted` | #4A5B78 | Secondary text (6.9:1 on white) |
| `ink-subtle` | #5D6D88 | Tertiary text (5.2:1 on white) |
| `night` | #03152C | Hero and footer only |
| `signal` | #0866FF | The only action and selection colour, in every portal (white text 4.8:1) |
| `beacon` | #FF6A00 | Main marketing call to action and live state only; always ink text (5.95:1), never white |
| `paper` | #F7F9FC | App background |
| `surface` | #FFFFFF | Cards, tables, inputs |
| `line` | #DCE4F0 | Borders and dividers |
| `line-strong` | #7A8AA5 | Form control borders (3.5:1, meets WCAG 1.4.11) |

Status sets, each with `-bg`, `-fg` and `-border` (all fg/bg pairs ≥ 5.7:1): `success`, `warning`, `danger`, `info`, plus `danger-solid` for destructive buttons.

There are no per-portal accent colours. Admin is distinguished by density and a role label. The old names (`brand-navy`, `brand-blue`, `brand-orange`, `muted-foreground`, `--portal-accent`) remain as aliases until every screen is migrated.

## Typography

- Body and app text: the platform UI font stack (`--font-facebook-ui`).
- Headings and display text only: **Overpass**, loaded with `next/font/google` (downloaded at build time and served from this site). `h1`–`h3` use it automatically; use the `font-heading` utility elsewhere.
- Scale: Tailwind's default steps, 12, 14, 16, 18, 20, 24, 30, 36 and 48px. Nothing below 12px (`text-xs`).
- Money and metrics use tabular numerals (`tabular-nums`, or `data-numeric` on table cells).
- Sentence case everywhere.

## Components (`src/components/ui`)

| Component | Notes |
|---|---|
| `Button` | `primary` (signal), `brand` (beacon, marketing only), `secondary`, `outline`, `ghost`, `destructive`, `link`; sizes `sm`, `md` (44px), `lg`, `icon`; `loading` |
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

Motion responds to user actions only (overlay open, press, hover), plus one orchestrated hero moment. All animation is wrapped in `motion-safe:` or disabled under `prefers-reduced-motion: reduce`.

## Copy

Plain, active and specific. Buttons say exactly what happens ("Submit for review"). Errors say what went wrong and how to fix it. Empty states invite the next action.

## Checks

- `BASE_URL=http://127.0.0.1:3000 npm run test:visual` against a running production build compares `/design-system` at 390 and 1440px with `tests/visual/baselines`, runs axe (WCAG 2.2 AA) on the page and with the dialog and drawer open, checks focus returns after closing the dialog, and fails on horizontal overflow or console errors. Add `-- --update` to rewrite baselines after an intended visual change. Baselines were captured on Linux with Playwright's Chromium; font rendering differs on other platforms. This check is not part of CI.
- Prettier (`.prettierrc.json`) formats only files touched by the redesign: `npx prettier --write <files>`.
