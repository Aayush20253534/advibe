import type { Metadata } from "next";
import { brand } from "./brand";
import { siteOrigin } from "@/services/site-origin.mjs";

export function publicMetadata(path: string, title: string, description: string): Metadata {
  const origin = siteOrigin(process.env.NEXT_PUBLIC_APP_URL);
  const indexable = !!origin && process.env.SITE_INDEXING_ENABLED === "true" && !["/privacy", "/terms"].includes(path);
  const url = origin ? new URL(path, origin).toString() : undefined;
  return {
    title, description,
    robots: { index: indexable, follow: indexable },
    ...(url ? { alternates: { canonical: url } } : {}),
    openGraph: {
      title: `${title} | ${brand.name}`, description, siteName: brand.name, type: "website", locale: "en_IN",
      ...(url ? { url, images: [{ url: new URL("/images/blinkmyad/fleet.webp", origin!).toString(), alt: "BlinkMyAd vehicle-screen concept artwork" }] } : {}),
    },
    twitter: { card: "summary_large_image", title: `${title} | ${brand.name}`, description },
  };
}
