import type { Metadata } from "next";
import { DriverNotifications } from "@/features/driver-live/screens";

export const metadata: Metadata = { title: "Notifications", robots: { index: false, follow: false } };

export default function Page() {
  return <DriverNotifications />;
}
