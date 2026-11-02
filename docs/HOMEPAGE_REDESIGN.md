# AdVibe homepage visual implementation

The redesigned landing page uses the existing AdVibe navy (`#03152C` / `#041B3D`), blue (`#0866FF`), orange (`#FF6A00`) and white identity. The public navbar and footer live in `src/components/layout/public-shell.tsx`; the homepage is `src/app/(site)/page.tsx`.

## Component architecture

- `home-motion.tsx`: scroll reveals, independently animated vehicle layers, a scroll-controlled campaign workflow, and an illustrative India network map. Animations honor `prefers-reduced-motion`.
- `homepage.css`: responsive hero layering and minimal UI motion.
- Reuse assets from `public/images/` as committed in the previous asset pack; no new unrelated assets or backend changes.
- The map geometry and Prayagraj position originate from the committed `public/images/coverage/india-map.svg`. The four orange outward connections are *illustrations of potential future reach*, not live routes, inventory or coverage. Other cities are not labeled operational.

## Performance and accessibility

The homepage remains a server component and imports a narrow client module for motion. Only opacity and transforms are animated for most elements. The animated route lines use SVG pathLength; desktop vehicle layers animate once on entry. Small screens and reduced-motion users receive a static hero image. Buttons, links, titles and sections remain HTML, not text embedded in image files. Hero background gets `priority`; below-the-fold images are lazy by default.

## Verification

Local syntax: `node` + TypeScript `createSourceFile` parser for TSX.
Static source contracts: `node --test tests/homepage-redesign.test.mjs`.
Before release run `npm run lint`, `npm run typecheck`, `npm run test:integration`, `npm run test:contracts`, `npm run build`, followed by responsive browser screenshot and motion checks. Do not infer a full green suite from Vercel's build result alone.

## Visual caveat

Vehicle cutouts are generated concept artwork and their transparency edges and mounting must be reviewed at desktop and mobile resolutions. This design does not establish that actual AdVibe hardware is deployed. The static hero fallback is used on smaller screens and under reduced motion to avoid mismatched layers.
