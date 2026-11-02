import type { Metadata } from "next";
import { DriverVerification } from "@/features/driver-live/screens";

export const metadata: Metadata = { title: "Verification status", robots: { index: false, follow: false } };

export default function Page() {
  return <DriverVerification />;
}
