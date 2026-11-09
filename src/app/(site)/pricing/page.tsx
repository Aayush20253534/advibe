import Link from "next/link";
import { CalendarDays, Layers3, MapPinned, ShieldCheck } from "lucide-react";
import { publicMetadata } from "@/config/public-metadata";
import { PricingPlanner } from "@/components/public/pricing-planner";
import { FAQList } from "@/components/public/faq-list";
import { publicFAQs } from "@/components/public/faq-data";
import { DetailPage, DetailHero, DetailSection, DetailCards, DetailRibbon, DetailCTA } from "@/components/public/secondary-pages";

export const metadata = publicMetadata("/pricing", "Advertising Pricing & Cost Calculator", "Explore illustrative BlinkMyAd vehicle-screen advertising costs in Prayagraj. Real prices and availability are confirmed before booking.");

export default function PricingPage() {
  return <DetailPage name="pricing">
    <DetailHero
      eyebrow="Advertising pricing"
      title={<>Plan your campaign.<br /><em>Know the possibilities.</em></>}
      description="Estimate a local vehicle-screen campaign in Prayagraj. Choose a format, screen quantity and duration, then explore how each choice affects an example cost."
      image="/images/blinkmyad/fleet.webp"
      imageAlt="BlinkMyAd scooter and auto-rickshaw with digital advertising screens"
      actions={[{ label: "Try the cost calculator", href: "#estimate" }, { label: "Explore formats", href: "/ad-formats", secondary: true }]}
      facts={["Flexible campaign lengths", "Screen-based planning", "Free campaign drafts"]}
      note="Example amounts are illustrative, not a published rate card or a payable quote."
    />

    <DetailSection id="estimate" title="Build your example estimate" description="Adjust the campaign settings to understand the model. No booking or payment is made here." className="bma-detail-workspace">
      <div className="bma-detail-tool"><PricingPlanner /></div>
    </DetailSection>

    <DetailSection id="price-factors" title="What shapes your campaign quote?" description="A final quote depends on confirmed vehicle inventory, campaign settings and the approved commercial terms." tone="blue">
      <DetailCards columns={4} items={[
        { icon: Layers3, title: "Screen placement", text: "Bike, auto and car placements may have different confirmed rates." },
        { icon: MapPinned, title: "Reach and location", text: "Available routes and service areas determine what can be booked." },
        { icon: CalendarDays, title: "Dates and frequency", text: "Duration, number of screens and eligible daily plays affect the plan." },
        { icon: ShieldCheck, title: "Review and confirmation", text: "Creatives, inventory, applicable taxes and final terms are checked before booking." },
      ]} />
      <div className="mt-6"><DetailRibbon>Illustrative GST and example daily values in the calculator are for planning only. A final quote is supplied through the campaign workflow.</DetailRibbon></div>
    </DetailSection>

    <DetailSection id="pricing-questions" title="Questions about pricing" description="The essentials before you create your first campaign draft."
      aside={<Link href="/help-center">View all questions</Link>}>
      <div className="bma-detail-faq max-w-4xl"><FAQList items={publicFAQs.filter(f => f.category === "Payments" || f.question.includes("change or pause"))} /></div>
    </DetailSection>

    <DetailCTA
      title="Ready to work with a real budget?"
      description="Create an account and build a free draft. Pricing and availability are confirmed before a campaign is booked."
      action={{ label: "Create an advertiser account", href: "/signup?role=advertiser" }}
      secondaryAction={{ label: "Talk to us", href: "/contact" }}
    />
  </DetailPage>;
}
