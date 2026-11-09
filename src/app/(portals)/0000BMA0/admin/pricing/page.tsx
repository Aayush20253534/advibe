import type { Metadata } from "next";
import { Pricing } from "@/features/admin-live/catalog";

export const metadata: Metadata = { title: "Pricing", robots: { index: false, follow: false } };

export default function Page() {
  return <Pricing />;
}
