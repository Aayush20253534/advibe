import type { Metadata } from "next";
import { CTA, PageHero, Section } from "@/components/public/marketing-blocks";
import { LocationSearch } from "@/components/public/location-search";

export const metadata: Metadata = {
  title: "Locations & Coverage Explorer",
  description:
    "Explore concept cities and fictional sample screen locations for AdVibe campaign planning; live inventory is not provided.",
};

// Purpose: show how area-based planning works, using clearly labelled sample data.
export default function Page() {
  return (
    <>
      <PageHero
        title="Plan by city and area"
        description="Campaigns are planned by city and zone. Explore the sample areas below to see how it works."
        note="The areas and screen counts on this page are fictional samples, not live inventory or a list of cities where AdVibe operates."
      />
      <Section>
        <LocationSearch />
      </Section>
      <CTA
        title="Ask about your city"
        text="Tell us where you want to advertise and we'll confirm what's available."
        label="Contact AdVibe"
        href="/contact"
      />
    </>
  );
}
