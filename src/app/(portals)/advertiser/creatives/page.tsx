import type { Metadata } from "next";
import { CreativeLibrary } from "@/features/advertiser-live/workflows";
import { BusinessScoped } from "@/features/advertiser-live/portal";

export const metadata: Metadata = { title: "Creative library", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <BusinessScoped>
      <CreativeLibrary />
    </BusinessScoped>
  );
}
