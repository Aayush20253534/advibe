import type { Metadata } from "next";
import { Directory } from "@/features/advertiser-live/operations";

export const metadata: Metadata = { title: "Ad formats", robots: { index: false, follow: false } };

export default function Page() {
  return <Directory kind="ad-formats" />;
}
