import type { Metadata } from "next";
import { DriverVehicles } from "@/features/driver-live/screens";

export const metadata: Metadata = { title: "Vehicle and screen", robots: { index: false, follow: false } };

export default function Page() {
  return <DriverVehicles />;
}
