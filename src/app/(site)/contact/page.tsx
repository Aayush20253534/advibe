import { Headphones, Megaphone, MessageSquareText, ShieldCheck, UsersRound } from "lucide-react";
import { publicMetadata } from "@/config/public-metadata";
import { ContactEnquiry } from "@/components/public/contact-enquiry";
import { DetailPage, DetailHero, DetailSection, DetailCards, DetailCTA, DetailRibbon } from "@/components/public/secondary-pages";

export const metadata = publicMetadata("/contact", "Contact BlinkMyAd | Enquiries & Support", "Contact BlinkMyAd about vehicle-screen advertising, campaign planning and driver partnerships in Prayagraj.");

export default function ContactPage() {
  return <DetailPage name="contact">
    <DetailHero
      eyebrow="Contact BlinkMyAd"
      title={<>Good questions.<br /><em>Clear next steps.</em></>}
      description="Planning a vehicle-screen campaign, considering driver partnership or looking for account support? Find the right way to connect with BlinkMyAd."
      image="/images/blinkmyad/ad-formats/auto-rear.webp"
      imageAlt="BlinkMyAd rear-screen advertising placement on an auto-rickshaw"
      actions={[{ label: "Reach the team", href: "#get-in-touch" }, { label: "Browse help", href: "/help-center", secondary: true }]}
      facts={["Prayagraj pilot", "Advertiser enquiries", "Partner guidance"]}
    />

    <DetailSection title="What can we help you with?" id="contact-topics" description="Choose the starting point that matches your question.">
      <DetailCards columns={3} items={[
        { icon: Megaphone, title: "Advertising enquiries", text: "Explore placements, campaign planning, creative review and pricing.", href: "/for-advertisers" },
        { icon: UsersRound, title: "Driver partnerships", text: "Understand eligibility, onboarding, vehicle types and verified opportunities.", href: "/for-drivers" },
        { icon: Headphones, title: "Existing account support", text: "Members can open support tickets in their account portal. Public FAQs are also available.", href: "/help-center" },
      ]} />
    </DetailSection>

    <DetailSection id="get-in-touch" title="Get in touch" description="Use the enquiry form when verified public submissions are enabled, or follow the available account and help options." tone="blue" className="bma-detail-workspace">
      <div className="bma-detail-tool"><ContactEnquiry /></div>
    </DetailSection>

    <DetailSection title="How we handle enquiries" id="contact-approach">
      <div className="bma-detail-cards bma-detail-cards-2">
        <article className="bma-detail-card"><span className="bma-detail-card-icon"><MessageSquareText aria-hidden="true" /></span><h3>Route your question clearly</h3><p>Choose an enquiry subject and include relevant campaign or vehicle details, so the right team can assess it when submissions are available.</p></article>
        <article className="bma-detail-card"><span className="bma-detail-card-icon"><ShieldCheck aria-hidden="true" /></span><h3>Respect verification requirements</h3><p>When the public form is active, it requires human verification and consent. Availability is displayed by the form itself.</p></article>
      </div>
      <div className="mt-6"><DetailRibbon>BlinkMyAd is beginning in Prayagraj. Published areas and early campaign planning do not guarantee a booked screen or an installation appointment.</DetailRibbon></div>
    </DetailSection>

    <DetailCTA
      title="Prefer to explore first?"
      description="See how the platform works, compare placements and learn what to prepare before booking."
      action={{ label: "How BlinkMyAd works", href: "/how-it-works" }}
      secondaryAction={{ label: "Visit help centre", href: "/help-center" }}
    />
  </DetailPage>;
}
