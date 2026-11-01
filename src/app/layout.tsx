import type { Metadata, Viewport } from "next";
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
  title: { default: "AdVibe", template: "%s | AdVibe" },
  description: "Your Brand. Everywhere. An outdoor and mobility advertising platform.",
  applicationName: "AdVibe",
  icons: { icon: "/icon.png", shortcut: "/icon.png", apple: "/icon.png" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={overpass.variable}>
      <body className="min-h-screen antialiased">
        <MockProviderBanner />
        {children}
      </body>
    </html>
  );
}
