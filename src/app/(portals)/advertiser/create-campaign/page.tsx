import type { Metadata } from "next";
import { CampaignEditor } from "@/features/advertiser-live/workflows";
import { BusinessScoped } from "@/features/advertiser-live/portal";

export const metadata: Metadata = { title: "Create campaign", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <BusinessScoped>
      <CampaignEditor />
    </BusinessScoped>
  );
}
