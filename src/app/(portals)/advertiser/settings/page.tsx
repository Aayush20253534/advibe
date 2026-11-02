import type { Metadata } from "next";
import { BusinessSettings } from "@/features/advertiser-live/operations";
import { BusinessScoped } from "@/features/advertiser-live/portal";

export const metadata: Metadata = { title: "Profile and settings", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <BusinessScoped>
      <BusinessSettings />
    </BusinessScoped>
  );
}
