import type { Metadata } from "next";
import { CampaignDetail } from "@/features/advertiser-live/workflows";

export const metadata: Metadata = { title: "Campaign details", robots: { index: false, follow: false } };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CampaignDetail id={id} />;
}
