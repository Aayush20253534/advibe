import type { Metadata } from "next";
import { Benefits, CTA, Heading, PageHero, Section } from "@/components/public/marketing-blocks";
import { FormatCatalogue } from "@/components/public/format-catalogue";
import { FAQList } from "@/components/public/faq-list";
import { publicFAQs } from "@/components/public/faq-data";
import { Eye, FileImage, ShieldCheck, Target } from "lucide-react";

export const metadata: Metadata = {
  title: "Ad Formats | Digital Vehicle Advertising",
  description:
    "Compare bike, auto-rickshaw and car advertising placements, screen formats, creative concepts and example specifications.",
};

// Purpose: help an advertiser pick a placement and prepare the right creative for it.
export default function Page() {
  return (
    <>
      <PageHero
        title="Ad formats"
        description="Compare where each placement sits, who sees it and what it suits, then estimate the cost of the one you choose."
      />
      <Section>
        <FormatCatalogue />
      </Section>
      <Section muted labelledBy="choosing">
        <Heading id="choosing" title="How to choose a format" />
        <Benefits
          items={[
            {
              title: "Who will see it",
              text: "Rear screens reach following traffic and pedestrians; seat-back screens reach passengers for the whole ride.",
              icon: Eye,
            },
            {
              title: "Where it travels",
              text: "Autos and bikes stay on local routes; cars cover more of the city.",
              icon: Target,
            },
            {
              title: "The file you need",
              text: "Prepare your image or video in the format's aspect ratio. An admin checks it before it can run.",
              icon: FileImage,
            },
            {
              title: "What is allowed",
              text: "Ads must follow AdVibe's content rules and the law. Misleading or prohibited content is rejected.",
              icon: ShieldCheck,
            },
          ]}
        />
      </Section>
      <Section labelledBy="faq">
        <Heading
          id="faq"
          title="Questions about formats"
          action={{ label: "See all questions", href: "/help-center" }}
        />
        <div className="max-w-3xl">
          <FAQList
            items={publicFAQs.filter(
              (x) => x.category === "Technical" || x.question.includes("types of vehicle"),
            )}
          />
        </div>
      </Section>
      <CTA
        title="Picked a format?"
        text="Create an account to upload your creative and build a campaign draft."
        label="Create an advertiser account"
        href="/signup?role=advertiser"
      />
    </>
  );
}
