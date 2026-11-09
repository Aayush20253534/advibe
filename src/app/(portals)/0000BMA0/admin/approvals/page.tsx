import type { Metadata } from "next";
import { Approvals } from "@/features/admin-live/reviews";

export const metadata: Metadata = { title: "Approvals", robots: { index: false, follow: false } };

export default function Page() {
  return <Approvals />;
}
