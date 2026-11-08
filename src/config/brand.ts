/** Public identity is independent of legacy ADVIBE_* contracts and database names. */
export const brand = {
  name: "BlinkMyAd",
  legalName: "Blink My Ad Pvt Ltd",
  tagline: "Make your next move visible.",
  // Contact details are intentionally unpublished until supplied by the owner.
  publicContact: null,
  description: "Reviewed vehicle-screen advertising in Prayagraj, connecting advertisers and vehicle partners.",
  launchCity: "Prayagraj",
  assets: {
    public: { src: "/brand/blinkmyad-logo.png", alt: "BlinkMyAd", width: 1000, height: 179 },
    auth: { src: "/brand/blinkmyad-logo.png", alt: "BlinkMyAd" },
  },
} as const;
