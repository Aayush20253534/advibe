import { publicMetadata } from "@/config/public-metadata";
import { CTA, PageHero, Section } from "@/components/public/marketing-blocks";
import { LocationSearch } from "@/components/public/location-search";

export const metadata = publicMetadata("/locations", "Locations & Coverage Explorer", "Explore published vehicle-screen advertising locations in Prayagraj. Real availability is confirmed when planning a campaign.");

// Published catalogue locations; availability remains server-authoritative.
export default function Page() {
  return (
    <>
      <PageHero
        title="Advertising locations in Prayagraj"
        description="Explore locations published by BlinkMyAd for our first launch city. Find an area and plan a local vehicle-screen campaign."
        note="Only published locations are shown. A location listing does not guarantee available screens or booking dates."
      />
      <Section>
        <LocationSearch />
      </Section>
      <CTA
        title="Plan a Prayagraj campaign"
        text="Have a specific route or neighbourhood in mind? Ask the team about the current Prayagraj rollout."
        label="Contact BlinkMyAd"
        href="/contact"
      />
    </>
  );
}
