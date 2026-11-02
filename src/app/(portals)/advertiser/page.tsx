import type { Metadata } from "next";
import { Dashboard } from "@/features/advertiser-live/workflows";
import { BusinessScoped } from "@/features/advertiser-live/portal";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <BusinessScoped>
      <Dashboard />
    </BusinessScoped>
  );
}
