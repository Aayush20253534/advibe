import type { Metadata } from "next";
import { MoneyAndQuotes } from "@/features/advertiser-live/operations";
import { BusinessScoped } from "@/features/advertiser-live/portal";

export const metadata: Metadata = { title: "Billing and payments", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <BusinessScoped>
      <MoneyAndQuotes />
    </BusinessScoped>
  );
}
