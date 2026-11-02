import type { Metadata } from "next";
import { Analytics } from "@/features/admin-live/operations";

export const metadata: Metadata = { title: "Reports", robots: { index: false, follow: false } };

export default function Page() {
  return <Analytics />;
}
