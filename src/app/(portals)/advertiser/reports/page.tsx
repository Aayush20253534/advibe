import type { Metadata } from "next";
import { Reports } from "@/features/advertiser-live/operations";
import { BusinessScoped } from "@/features/advertiser-live/portal";

export const metadata: Metadata = { title: "Reports", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <BusinessScoped>
      <Reports />
    </BusinessScoped>
  );
}
