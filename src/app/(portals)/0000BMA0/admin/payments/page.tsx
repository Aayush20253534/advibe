import type { Metadata } from "next";
import { Payments } from "@/features/admin-live/operations";

export const metadata: Metadata = { title: "Payments and refunds", robots: { index: false, follow: false } };

export default function Page() {
  return <Payments />;
}
