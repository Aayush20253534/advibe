import type { Metadata } from "next";
import { Settings } from "@/features/admin-live/operations";

export const metadata: Metadata = { title: "Security settings", robots: { index: false, follow: false } };

export default function Page() {
  return <Settings />;
}
