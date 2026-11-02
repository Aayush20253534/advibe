import type { Metadata } from "next";
import {
  Benefits,
  CTA,
  FormatsGrid,
  Heading,
  InfoNote,
  PageHero,
  Section,
  Steps,
  advertiserBenefits,
  advertiserSteps,
} from "@/components/public/marketing-blocks";
import { FAQList } from "@/components/public/faq-list";
import { publicFAQs } from "@/components/public/faq-data";

export const metadata: Metadata = {
  title: "For Advertisers | Vehicle Screen Campaigns",
  description:
    "Explore vehicle-screen advertising formats and campaign planning in Prayagraj with AdVibe.",
};

// Purpose: explain to a business what running a campaign involves and what it controls.
export default function Page() {
  return (
    <>
      <PageHero
        title="Your next local campaign, on the move in Prayagraj"
        description="Plan locally relevant advertising using digital screens on bikes, autos and cars in Prayagraj. Choose a format and schedule, then submit your creative for review. Availability is confirmed before booking."
        actions={[
          { label: "Create an advertiser account", href: "/signup?role=advertiser" },
          { label: "Estimate the cost", href: "/pricing", secondary: true },
        ]}
      />
      <Section labelledBy="why">
        <Heading id="why" title="Why advertise on vehicle screens" />
        <Benefits items={advertiserBenefits} />
      </Section>
      <Section muted labelledBy="steps">
        <Heading
          id="steps"
          title="How a campaign runs"
          description="Four steps from sign-up to an approved campaign."
        />
        <Steps items={advertiserSteps} />
        <InfoNote>
          Drafts are free. Nothing is booked or charged when you create or save a campaign draft.
        </InfoNote>
      </Section>
      <Section labelledBy="formats">
        <Heading
          id="formats"
          title="Choose where your ad appears"
          action={{ label: "Compare all formats", href: "/ad-formats" }}
        />
        <FormatsGrid short />
      </Section>
      <Section muted labelledBy="faq">
        <Heading
          id="faq"
          title="Questions advertisers ask"
          action={{ label: "See all questions", href: "/help-center" }}
        />
        <div className="max-w-3xl">
          <FAQList
            items={publicFAQs.filter(
              (f) => f.category === "Advertisers" || f.category === "Payments",
            )}
          />
        </div>
      </Section>
      <CTA
        title="Start with a free draft"
        text="Create an account, upload a creative and build a draft. You decide whether to submit it."
        label="Create an advertiser account"
        href="/signup?role=advertiser"
      />
    </>
  );
}
