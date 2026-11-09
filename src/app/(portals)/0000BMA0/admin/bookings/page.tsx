import type { Metadata } from "next";
import { Bookings } from "@/features/admin-live/operations";

export const metadata: Metadata = { title: "Bookings and schedule", robots: { index: false, follow: false } };

export default function Page() {
  return <Bookings />;
}
