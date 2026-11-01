import type { Metadata } from "next";
import { CTA, Heading, PageHero, Section } from "@/components/public/marketing-blocks";
import { PricingPlanner } from "@/components/public/pricing-planner";
import { FAQList } from "@/components/public/faq-list";
import { publicFAQs } from "@/components/public/faq-data";

export const metadata: Metadata = {
  title: "Advertising Pricing & Cost Calculator",
  description:
    "Explore AdVibe advertising placement prices with an illustrative calculator. Final rates and availability are subject to confirmed commercial terms.",
};

// Purpose: explain how cost is built up and let people try an example estimate.
export default function Page() {
  return (
    <>
      <PageHero
        title="What a campaign costs"
        description="AdVibe prices campaigns per screen, per day. Try an example below: change the format, the number of screens and the campaign length to see how the cost adds up."
        note="Example rates only. Your real quote comes from the rate card for your city when you plan a campaign."
      />
      <Section>
        <PricingPlanner />
      </Section>
      <Section muted labelledBy="faq">
        <Heading
          id="faq"
          title="Questions about pricing"
          action={{ label: "See all questions", href: "/help-center" }}
        />
        <div className="max-w-3xl">
          <FAQList
            items={publicFAQs.filter(
              (f) => f.category === "Payments" || f.question.includes("change or pause"),
            )}
          />
        </div>
      </Section>
      <CTA
        title="Get a real quote"
        text="Create an account and plan a campaign to see the confirmed price for your city."
        label="Create an advertiser account"
        href="/signup?role=advertiser"
      />
    </>
  );
}
