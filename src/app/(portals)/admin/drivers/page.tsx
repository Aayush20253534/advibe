import type { Metadata } from "next";
import { DriverReviews } from "@/features/admin-live/reviews";

export const metadata: Metadata = { title: "Driver partners", robots: { index: false, follow: false } };

export default function Page() {
  return <DriverReviews />;
}
