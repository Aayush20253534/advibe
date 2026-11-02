import type { Metadata } from "next";
import { CampaignIndex } from "@/features/advertiser-live/workflows";
import { BusinessScoped } from "@/features/advertiser-live/portal";

export const metadata: Metadata = { title: "My campaigns", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <BusinessScoped>
      <CampaignIndex />
    </BusinessScoped>
  );
}
