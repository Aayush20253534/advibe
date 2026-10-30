import type { Metadata, Viewport } from "next";
import "./globals.css";
import { MockProviderBanner } from "@/components/layout/mock-provider-banner";

export const metadata: Metadata = {
  title: { default: "AdVibe", template: "%s | AdVibe" },
  description: "Your Brand. Everywhere. An outdoor and mobility advertising platform.",
  applicationName: "AdVibe",
  icons: { icon: "/icon.png", shortcut: "/icon.png", apple: "/icon.png" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased"><MockProviderBanner />{children}</body>
    </html>
  );
}
