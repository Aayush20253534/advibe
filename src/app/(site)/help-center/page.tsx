import { BadgeHelp, BookOpen, CarFront, Megaphone } from "lucide-react";
import { publicMetadata } from "@/config/public-metadata";
import { HelpSearch } from "@/components/public/help-search";
import { DetailPage, DetailHero, DetailSection, DetailCards, DetailCTA } from "@/components/public/secondary-pages";

export const metadata = publicMetadata("/help-center", "Help Center Support & FAQs", "Browse BlinkMyAd frequently asked questions, campaign guides, pricing, coverage and driver onboarding information.");

export default function HelpCentrePage() {
  return <DetailPage name="help-center">
    <DetailHero
      eyebrow="Help centre"
      title={<>The answers you need.<br /><em>All in one place.</em></>}
      description="Explore practical guidance on campaigns, vehicle screens, pricing, verification and driver partnerships. Search our help topics to get the details."
      image="/images/blinkmyad/ad-formats/hero.webp"
      imageAlt="BlinkMyAd vehicle-screen advertising concept"
      actions={[{ label: "Search questions", href: "#help-questions" }, { label: "Contact support", href: "/contact", secondary: true }]}
      facts={["Campaign help", "Driver onboarding", "Pricing and availability"]}
    />

    <DetailSection title="Find what you're looking for" id="help-guides" description="Start with a guide, then use the searchable answers below.">
      <DetailCards columns={4} items={[
        { icon: Megaphone, title: "For advertisers", text: "Learn how to prepare a campaign, choose formats and submit for review.", href: "/for-advertisers" },
        { icon: CarFront, title: "For drivers", text: "Understand verification, supported vehicles and partnership terms.", href: "/for-drivers" },
        { icon: BookOpen, title: "How it works", text: "Follow each stage from choosing a screen to an approved campaign.", href: "/how-it-works" },
        { icon: BadgeHelp, title: "Costs and coverage", text: "Explore example costs and the currently published Prayagraj areas.", href: "/pricing" },
      ]} />
    </DetailSection>

    <DetailSection title="Search questions and guides" id="help-questions" description="Filter questions by topic or enter a keyword to find the relevant answer." tone="blue" className="bma-detail-workspace">
      <div className="bma-detail-tool"><HelpSearch /></div>
    </DetailSection>

    <DetailSection id="help-next" title="A few useful starting points" description="The current rollout is focused on verified local placements, not unconfirmed availability.">
      <div className="bma-detail-stages">
        {[
          { n: "01", title: "Browse the formats", text: "Understand the placement and creative specifications for your campaign." },
          { n: "02", title: "Plan a draft", text: "Choose your preferred setup and submit for human review." },
          { n: "03", title: "Confirm the details", text: "Review availability, pricing and approval status before proceeding." },
        ].map(step => <article key={step.n} className="bma-detail-stage"><strong>{step.n}</strong><div><h3>{step.title}</h3><p>{step.text}</p></div></article>)}
      </div>
    </DetailSection>

    <DetailCTA
      title="Still have a question?"
      description="See the available contact options or open a support request through your advertiser or driver account."
      action={{ label: "Contact BlinkMyAd", href: "/contact" }}
      secondaryAction={{ label: "Sign in", href: "/login" }}
    />
  </DetailPage>;
}
