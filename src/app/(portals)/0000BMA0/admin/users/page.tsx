import type { Metadata } from "next";
import { Users } from "@/features/admin-live/operations";

export const metadata: Metadata = { title: "Users and roles", robots: { index: false, follow: false } };

export default function Page() {
  return <Users />;
}
