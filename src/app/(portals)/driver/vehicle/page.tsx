import type { Metadata } from "next";
import { ApiSection } from "@/features/live/api-portal";

export const metadata: Metadata = { title: "Vehicle and screen", robots: { index: false, follow: false } };

export default function Page() {
  return <ApiSection />;
}
