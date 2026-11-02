import type { Metadata } from "next";
import { DriverNotYetAvailable } from "@/features/driver-live/screens";

export const metadata: Metadata = { title: "Assigned ads", robots: { index: false, follow: false } };

export default function Page() {
  return <DriverNotYetAvailable kind="assigned-ads" />;
}
