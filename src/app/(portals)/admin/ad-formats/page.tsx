import type { Metadata } from "next";
import { Formats } from "@/features/admin-live/catalog";

export const metadata: Metadata = { title: "Ad formats and rules", robots: { index: false, follow: false } };

export default function Page() {
  return <Formats />;
}
