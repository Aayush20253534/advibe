import type { Metadata } from "next";
import { DriverPayouts } from "@/features/driver-live/screens";

export const metadata: Metadata = { title: "Payout history", robots: { index: false, follow: false } };

export default function Page() {
  return <DriverPayouts />;
}
