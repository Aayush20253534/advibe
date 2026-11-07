import { publicMetadata } from "@/config/public-metadata";
import { PageHero, Section } from "@/components/public/marketing-blocks";
import { HelpSearch } from "@/components/public/help-search";

export const metadata = publicMetadata("/help-center", "Help Center Support & FAQs", "Browse BlinkMyAd frequently asked questions, marketing guides, campaign processes, pricing and driver onboarding information.");

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
