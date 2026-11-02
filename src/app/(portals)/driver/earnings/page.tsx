import type { Metadata } from "next";
import { DriverEarnings } from "@/features/driver-live/screens";

export const metadata: Metadata = { title: "Earnings", robots: { index: false, follow: false } };

export default function Page() {
  return <DriverEarnings />;
}
