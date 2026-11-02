import type { Metadata } from "next";
import { ApiSection } from "@/features/live/api-portal";

export const metadata: Metadata = { title: "Profile and documents", robots: { index: false, follow: false } };

export default function Page() {
  return <ApiSection />;
}
