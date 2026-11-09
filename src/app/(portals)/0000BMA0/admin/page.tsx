import type { Metadata } from "next";
import { Overview } from "@/features/admin-live/operations";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false, follow: false } };

export default function Page() {
  return <Overview />;
}
