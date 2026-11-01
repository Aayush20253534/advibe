import type { Metadata } from "next";
import {
  Benefits,
  CTA,
  Heading,
  InfoNote,
  PageHero,
  Requirements,
  Section,
  Steps,
  driverBenefits,
  driverSteps,
} from "@/components/public/marketing-blocks";
import { DriverVehicleTabs } from "@/components/public/driver-vehicle-tabs";
import { FAQList } from "@/components/public/faq-list";
import { publicFAQs } from "@/components/public/faq-data";

export const metadata: Metadata = {
  title: "Become an AdVibe Driver Partner",
  description:
    "Learn about the AdVibe driver partnership, supported vehicle formats, verification documents, screen installation and earnings process.",
};

// Purpose: tell a driver what partnering involves, what they need and how they get paid.
export default function Page() {
  return (
    <>
      <PageHero
        title="Earn from the routes you already drive"
        description="Carry an AdVibe screen on your bike, auto rickshaw or car. It shows approved ads while you work, and your earnings appear in your partner portal."
        actions={[
          { label: "Apply as a driver partner", href: "/signup?role=driver" },
          { label: "See what you need", href: "#requirements", secondary: true },
        ]}
      />
      <Section labelledBy="why">
        <Heading id="why" title="What partnering with AdVibe means" />
        <Benefits items={driverBenefits} />
      </Section>
      <Section muted labelledBy="vehicles">
        <Heading
          id="vehicles"
          title="Vehicles we work with"
          description="Choose your vehicle to see where the screen goes."
        />
        <DriverVehicleTabs />
      </Section>
      <Section labelledBy="steps">
        <Heading id="steps" title="From application to your first assignment" />
        <Steps items={driverSteps} />
      </Section>
      <Section muted id="requirements" labelledBy="requirements-title">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <Heading id="requirements-title" title="What you need to apply" />
            <Requirements />
            <InfoNote>
              Requirements can change with the final partner agreement and local regulations.
            </InfoNote>
          </div>
          <div>
            <Heading
              title="Questions drivers ask"
              action={{ label: "See all questions", href: "/help-center" }}
            />
            <FAQList items={publicFAQs.filter((f) => f.category === "Drivers")} />
          </div>
        </div>
      </Section>
      <CTA
        title="Apply in a few minutes"
        text="Create your partner account, add your vehicle and upload your documents. We review every application."
        label="Apply as a driver partner"
        href="/signup?role=driver"
      />
    </>
  );
}
