import type { Metadata } from "next";
import { Geo } from "@/features/admin-live/catalog";

export const metadata: Metadata = { title: "Locations and zones", robots: { index: false, follow: false } };

export default function Page() {
  return <Geo />;
}
