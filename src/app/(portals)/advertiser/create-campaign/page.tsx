import type { Metadata } from "next";
import { ReferenceCampaignBuilder } from "@/features/advertiser-live/reference-builder";
import { BusinessScoped } from "@/features/advertiser-live/portal";

export const metadata: Metadata = { title: "Create campaign", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <BusinessScoped>
      <ReferenceCampaignBuilder />
    </BusinessScoped>
  );
}
