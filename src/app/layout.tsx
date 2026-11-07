import type { Metadata, Viewport } from "next";
import { siteOrigin } from "@/services/site-origin.mjs";
import { brand } from "@/config/brand";
import { Overpass } from "next/font/google";
import "./globals.css";
import { MockProviderBanner } from "@/components/layout/mock-provider-banner";

// Headings and display text only. Body and app text keep the platform UI font.
// next/font downloads the font at build time and serves it from this site.
const overpass = Overpass({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-overpass",
});

export const metadata: Metadata = {
  title: { default: brand.name, template: "%s | " + brand.name },
  description: brand.description,
  applicationName: brand.name,
  robots: { index: process.env.SITE_INDEXING_ENABLED === "true" && !!siteOrigin(process.env.NEXT_PUBLIC_APP_URL), follow: false },
  icons: { icon: "/icon.png", shortcut: "/icon.png", apple: "/icon.png" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={overpass.variable}>
      <body className="min-h-screen antialiased">
        {process.env.NODE_ENV !== "production" && <MockProviderBanner />}
        {children}
      </body>
    </html>
  );
}
