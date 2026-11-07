import type { Metadata } from "next";
import { PageHero, Section } from "@/components/public/marketing-blocks";
import { HelpSearch } from "@/components/public/help-search";

export const metadata: Metadata = {
  title: "Help Center | BlinkMyAd Support & FAQs",
  description:
    "Browse BlinkMyAd frequently asked questions, marketing guides, campaign processes, pricing and driver onboarding information.",
};

// Purpose: answer common questions without contacting anyone.
export default function Page() {
  return (
    <>
      <PageHero title="Help centre" description="Answers for advertisers and driver partners." />
      <Section>
        <HelpSearch />
      </Section>
    </>
  );
}
