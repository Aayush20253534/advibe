import type { Metadata } from "next";
import { Support } from "@/features/admin-live/operations";

export const metadata: Metadata = { title: "Support and disputes", robots: { index: false, follow: false } };

export default function Page() {
  return <Support />;
}
