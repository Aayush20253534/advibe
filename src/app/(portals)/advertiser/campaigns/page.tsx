import type { Metadata } from "next";
import { ReferenceCampaigns } from "@/features/advertiser-live/reference-pages";
import { BusinessScoped } from "@/features/advertiser-live/portal";

export const metadata: Metadata = { title: "My campaigns", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <BusinessScoped>
      <ReferenceCampaigns />
    </BusinessScoped>
  );
}
