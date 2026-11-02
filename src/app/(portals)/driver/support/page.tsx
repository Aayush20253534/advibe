import type { Metadata } from "next";
import { DriverSupport } from "@/features/driver-live/screens";

export const metadata: Metadata = { title: "Support", robots: { index: false, follow: false } };

export default function Page() {
  return <DriverSupport />;
}
