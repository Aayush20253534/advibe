import type { Metadata } from "next";
import { Audit } from "@/features/admin-live/operations";

export const metadata: Metadata = { title: "Audit history", robots: { index: false, follow: false } };

export default function Page() {
  return <Audit />;
}
