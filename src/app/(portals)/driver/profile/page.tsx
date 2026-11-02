import type { Metadata } from "next";
import { DriverProfileScreen } from "@/features/driver-live/screens";

export const metadata: Metadata = { title: "Profile and documents", robots: { index: false, follow: false } };

export default function Page() {
  return <DriverProfileScreen />;
}
