/** Public identity is independent of legacy ADVIBE_* contracts and database names. */
export const brand = {
  name: "BlinkMyAd",
  description: "Reviewed vehicle-screen advertising in Prayagraj, connecting advertisers and vehicle partners.",
  launchCity: "Prayagraj",
  assets: {
    // Preserve the approved legacy master pending the owner's public artwork decision.
    public: { src: "/brand/advibe-logo-800.png", alt: "AdVibe — Your Brand. Everywhere.", width: 2048, height: 682 },
    // Existing BMA authentication artwork, not a new replacement logo.
    auth: { src: "/brand/bma-signup-logo.svg", alt: "BMA, Blink My Ad" },
  },
} as const;
