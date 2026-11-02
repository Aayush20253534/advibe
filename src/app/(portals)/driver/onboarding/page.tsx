import type { Metadata } from "next";
import { DriverOnboarding } from "@/features/driver-live/onboarding";

export const metadata: Metadata = { title: "Onboarding", robots: { index: false, follow: false } };

export default function Page() {
  return <DriverOnboarding />;
}
