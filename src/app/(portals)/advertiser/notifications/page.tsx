import type { Metadata } from "next";
import { AccountNotifications } from "@/features/advertiser-live/operations";

export const metadata: Metadata = { title: "Notifications", robots: { index: false, follow: false } };

export default function Page() {
  return <AccountNotifications />;
}
