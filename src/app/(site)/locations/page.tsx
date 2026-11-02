import type { Metadata } from "next";
import { CTA, PageHero, Section } from "@/components/public/marketing-blocks";
import { LocationSearch } from "@/components/public/location-search";

export const metadata: Metadata = {
  title: "Locations & Coverage Explorer",
  description:
    "Explore published vehicle-screen advertising locations in Prayagraj. Real availability is confirmed when planning a campaign.",
};

// Purpose: show how area-based planning works, using clearly labelled sample data.
export default function Page() {
  return (
    <>
      <PageHero
        title="Advertising locations in Prayagraj"
        description="Explore locations published by AdVibe for our first launch city. Find an area and plan a local vehicle-screen campaign."
        note="Only published backend locations are shown. A location listing does not guarantee available screens or booking dates."
      />
      <Section>
        <LocationSearch />
      </Section>
      <CTA
        title="Plan a Prayagraj campaign"
        text="Have a specific route or neighbourhood in mind? Ask the team about the current Prayagraj rollout."
        label="Contact AdVibe"
        href="/contact"
      />
    </>
  );
}
