import type { Metadata } from "next";
import { CTA, Heading, PageHero, Section } from "@/components/public/marketing-blocks";
import { PricingPlanner } from "@/components/public/pricing-planner";
import { FAQList } from "@/components/public/faq-list";
import { publicFAQs } from "@/components/public/faq-data";

export const metadata: Metadata = {
  title: "Advertising Pricing & Cost Calculator",
  description:
    "Estimate example vehicle-screen advertising costs for Prayagraj. Final rates and availability require a confirmed quote.",
};

// Purpose: explain how cost is built up and let people try an example estimate.
export default function Page() {
  return (
    <>
      <PageHero
        title="Advertising costs in Prayagraj"
        description="Explore an illustrative screen-day estimate for Prayagraj. Adjust format, screen quantity and dates to understand the pricing model."
        note="These values are examples, not a published rate card. Actual Prayagraj inventory, price and tax must be confirmed before checkout."
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
        text="Create an account to request a real quote against available Prayagraj screens and your chosen dates."
        label="Create an advertiser account"
        href="/signup?role=advertiser"
      />
    </>
  );
}
