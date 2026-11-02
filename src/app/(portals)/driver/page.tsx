import type { Metadata } from "next";
import { DriverToday } from "@/features/driver-live/screens";

export const metadata: Metadata = { title: "Today", robots: { index: false, follow: false } };

export default function Page() {
  return <DriverToday />;
}
