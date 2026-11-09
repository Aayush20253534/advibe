import Link from "next/link";
import { ArrowUpRight, BadgeCheck, CreditCard, FileCheck2, Info, Scale, ShieldCheck, Wrench } from "lucide-react";
import { publicMetadata } from "@/config/public-metadata";
import { brand } from "@/config/brand";
import { DetailPage, DetailHero, DetailSection, DetailCards, DetailRibbon, DetailCTA } from "@/components/public/secondary-pages";

export const metadata = publicMetadata("/terms", "Terms & Conditions | Legal Review Pending", "BlinkMyAd terms preview, pending commercial and legal approval.");

export default function TermsPage() {
  return <DetailPage name="terms">
    <DetailHero
      eyebrow="Company / legal information"
      title={<>Clear terms.<br /><em>Responsible rollout.</em></>}
      description="Review the current status of BlinkMyAd's advertiser and driver partner terms. Final commercial conditions are being prepared for approval."
      accent="legal"
      facts={["Human-reviewed processes", "Clear availability status"]}
      note={brand.legalName + " · Terms & Conditions preview"}
    />

    <DetailSection id="terms-status" title="Terms & Conditions" description="A transparent account of what is ready today and what still requires formal approval.">
      <div className="bma-detail-legal-layout">
        <article className="bma-detail-legal-panel">
          <DetailRibbon warning><strong>Legal approval pending.</strong> This page is a preview, not an operative agreement. The final advertiser and driver partner terms have not yet been supplied or approved.</DetailRibbon>
          <h2 className="mt-7">What this means today</h2>
          <p>Information about campaign pricing, locations, screen availability and partner opportunities is indicative until confirmed through the applicable workflow. No availability, revenue or earnings are guaranteed by this page.</p>
          <p>Accounts may be created, but payments, document storage and mapping features depend on the services enabled for the current rollout. Each workflow indicates what is actually available.</p>
        </article>
        <aside className="bma-detail-legal-side">
          <FileCheck2 className="mb-4 size-9 text-signal" aria-hidden="true" />
          <h3>Before you commit</h3>
          <p>Review the approved booking, participation and settlement conditions provided for your campaign or driver partnership. A preview is not a signed contract.</p>
          <Link href="/contact">Ask about the terms <ArrowUpRight aria-hidden="true" /></Link>
        </aside>
      </div>
    </DetailSection>

    <DetailSection id="terms-scope" title="What the final terms need to cover" description="These topics are pending approval. They are not a representation that commercial terms have already been agreed." tone="blue">
      <DetailCards columns={3} items={[
        { icon: CreditCard, title: "Campaign bookings and payment", text: "Approved pricing, taxes, checkout terms, cancellation and refunds." },
        { icon: BadgeCheck, title: "Creative and campaign review", text: "Content standards, review outcomes and campaign scheduling." },
        { icon: ShieldCheck, title: "Driver partner participation", text: "Verification, screen installation, safety, eligible routes and earnings conditions." },
        { icon: Wrench, title: "Support and service", text: "Maintenance responsibilities, issues, changes and account access." },
        { icon: Scale, title: "Disputes and responsibilities", text: "Applicable obligations and formal dispute-handling provisions." },
        { icon: Info, title: "Availability and limitations", text: "What is live, what is only planned and when commitments can be confirmed." },
      ]} />
    </DetailSection>

    <DetailCTA
      title="Need clarification before proceeding?"
      description="Contact the BlinkMyAd team about current rollout status and when final terms will apply."
      action={{ label: "Contact BlinkMyAd", href: "/contact" }}
      secondaryAction={{ label: "Privacy notice", href: "/privacy" }}
    />
  </DetailPage>;
}
