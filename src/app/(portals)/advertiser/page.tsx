import type { Metadata } from "next";
import { ReferenceDashboard } from "@/features/advertiser-live/reference-pages";
import { BusinessScoped } from "@/features/advertiser-live/portal";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <BusinessScoped>
      <ReferenceDashboard />
    </BusinessScoped>
  );
}
