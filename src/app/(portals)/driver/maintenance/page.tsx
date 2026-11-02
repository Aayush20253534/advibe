import type { Metadata } from "next";
import { DriverMaintenance } from "@/features/driver-live/screens";

export const metadata: Metadata = { title: "Maintenance and issues", robots: { index: false, follow: false } };

export default function Page() {
  return <DriverMaintenance />;
}
