# AdVibe homepage asset pack

Generated visual assets for the proposed spacious, scrollable homepage. These files are **not yet wired into the homepage**.

## Hero artwork
- `hero/hero-city.webp` — cinematic dark-background road scene (1920 × 1080)
- `hero/hero-bike.png`, `hero/hero-auto.png`, `hero/hero-car.png` — alpha-masked vehicle cutouts, for optional CSS/GSAP entrance animation
- `hero/hero-static.webp` — composed fallback for reduced motion, low-powered devices, and initial loading

## Feature sections
- `audience/advertisers.webp` — advertiser feature photography
- `audience/drivers.webp` — driver-partner feature photography
- `coverage/india-map.svg` — geographic outline of India with the initial Prayagraj launch marker (Natural Earth boundary)
- `cta/closing-road.webp` — dark cinematic closing call-to-action background

## Existing assets retained
The six files in `formats/` and the existing brand logo in `/brand/` are preserved.

## Implementation guidance
- Use `next/image` with the WebP files and set widths/heights. Reserve full transparency for PNG vehicle layers.
- Layer the three isolated vehicle PNGs over the hero-city background; use gentle translateX/opacity animations and an SVG orange trail, not autoplay video.
- Render `hero-static.webp` when `prefers-reduced-motion: reduce` is active.
- Keep the headline and CTA as real HTML rather than baked-in image text.
- Animate only transforms and opacity; never animate heavy full-size CSS filters.
- The illustration indicates an initial Prayagraj launch. It does not establish national inventory.
- These files are AI-generated conceptual artwork, not photos of deployed AdVibe hardware. Screen mounts and logos require real-world/hardware verification before marketing or production use.
- Some cutouts originated from a labeled concept sheet and contain reconstruction/edge artifacts; review them on desktop and mobile before publishing.
