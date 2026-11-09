import type { Metadata } from "next";
import { Settlements } from "@/features/admin-live/operations";

export const metadata: Metadata = { title: "Driver settlements", robots: { index: false, follow: false } };

export default function Page() {
  return <Settlements />;
}
