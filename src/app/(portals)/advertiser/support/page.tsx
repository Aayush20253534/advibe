import type { Metadata } from "next";
import { AccountSupport } from "@/features/advertiser-live/operations";

export const metadata: Metadata = { title: "Help and support", robots: { index: false, follow: false } };

export default function Page() {
  return <AccountSupport />;
}
