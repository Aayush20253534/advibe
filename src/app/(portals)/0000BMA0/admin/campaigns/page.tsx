import type { Metadata } from "next";
import { CampaignReviews } from "@/features/admin-live/reviews";

export const metadata: Metadata = { title: "Campaigns", robots: { index: false, follow: false } };

export default function Page() {
  return <CampaignReviews />;
}
