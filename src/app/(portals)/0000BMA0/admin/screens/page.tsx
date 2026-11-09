import type { Metadata } from "next";
import { Screens } from "@/features/admin-live/catalog";

export const metadata: Metadata = { title: "Screens and devices", robots: { index: false, follow: false } };

export default function Page() {
  return <Screens />;
}
