import type { Metadata } from "next";
import { DriverNotYetAvailable } from "@/features/driver-live/screens";

export const metadata: Metadata = { title: "Campaigns", robots: { index: false, follow: false } };

export default function Page() {
  return <DriverNotYetAvailable kind="campaigns" />;
}
