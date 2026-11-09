import { BadgeCheck, Compass, MapPin, Route, Search } from "lucide-react";
import { publicMetadata } from "@/config/public-metadata";
import { LocationSearch } from "@/components/public/location-search";
import { DetailPage, DetailHero, DetailSection, DetailCards, DetailRibbon, DetailCTA } from "@/components/public/secondary-pages";

export const metadata = publicMetadata("/locations", "Locations & Coverage Explorer", "Explore published BlinkMyAd vehicle-screen advertising locations in Prayagraj. Availability is confirmed during campaign planning.");

export default function LocationsPage() {
  return <DetailPage name="locations">
    <DetailHero
      eyebrow="Local advertising / Prayagraj"
      title={<>Your city.<br /><em>Your moving audience.</em></>}
      description="Discover the areas published for BlinkMyAd's Prayagraj pilot and plan where a vehicle-screen campaign might fit your business."
      image="/images/blinkmyad/homepage/05-prayagraj-city.webp"
      imageAlt="Illustration of Prayagraj roads and city buildings"
      actions={[{ label: "Explore published areas", href: "#coverage-explorer" }, { label: "See ad formats", href: "/ad-formats", secondary: true }]}
      facts={["Prayagraj-first rollout", "Location-led planning", "Availability checked before booking"]}
      note="Published locations do not guarantee currently available screens, routes or booking dates."
    />

    <DetailSection title="Plan locally. Reach on the move." id="locations-benefits" description="A clear, location-led way to think about your campaign before checking confirmed inventory.">
      <DetailCards columns={3} items={[
        { icon: MapPin, title: "Find your neighbourhood", text: "Search the areas actually published for the Prayagraj pilot. No fictional active coverage is shown." },
        { icon: Route, title: "Consider everyday routes", text: "Think about where customers travel, not only where they live or shop." },
        { icon: BadgeCheck, title: "Confirm before booking", text: "Inventory and dates are checked as part of campaign planning and review." },
      ]} />
    </DetailSection>

    <DetailSection title="Explore published Prayagraj areas" id="coverage-explorer" description="Search live catalogue entries and review available location information. This is not a real-time booking tool." tone="blue" className="bma-detail-workspace">
      <div className="bma-detail-tool"><LocationSearch /></div>
    </DetailSection>

    <DetailSection id="locations-process" title="From an area to a campaign" description="Three practical stages for location-first advertising.">
      <div className="bma-detail-stages">
        {[
          { n: "01", title: "Explore the city", text: "Find the published locations and choose an area relevant to your audience." },
          { n: "02", title: "Choose a placement", text: "Compare bike, auto or car-screen formats and prepare your creative." },
          { n: "03", title: "Confirm availability", text: "Request a real quote and review inventory before any campaign is booked." },
        ].map(step => <article key={step.n} className="bma-detail-stage"><strong>{step.n}</strong><div><h3>{step.title}</h3><p>{step.text}</p></div></article>)}
      </div>
      <div className="mt-6"><DetailRibbon>Only backend-published locations are listed. Areas not yet published are not presented as available, and screen inventory is confirmed separately.</DetailRibbon></div>
    </DetailSection>

    <DetailCTA
      title="Have a specific Prayagraj route in mind?"
      description="Tell the team your preferred area or build a campaign draft to explore confirmed screen options."
      action={{ label: "Contact BlinkMyAd", href: "/contact" }}
      secondaryAction={{ label: "Create a campaign draft", href: "/signup?role=advertiser" }}
    />
  </DetailPage>;
}
