import Link from "next/link";
import { ArrowUpRight, Cookie, FileText, KeyRound, ShieldCheck, UserRound } from "lucide-react";
import { publicMetadata } from "@/config/public-metadata";
import { brand } from "@/config/brand";
import { DetailPage, DetailHero, DetailSection, DetailCards, DetailRibbon, DetailCTA } from "@/components/public/secondary-pages";

export const metadata = publicMetadata("/privacy", "Privacy Notice | Legal Review Pending", "BlinkMyAd privacy notice preview. The final policy awaits legal approval.");

export default function PrivacyPage() {
  return <DetailPage name="privacy">
    <DetailHero
      eyebrow="Company / privacy"
      title={<>Your information.<br /><em>Handled with care.</em></>}
      description="Understand the data practices currently described for BlinkMyAd and the areas that still require an approved privacy notice."
      accent="legal"
      facts={["Account information", "Session-based access", "Verification workflows"]}
      note={brand.legalName + " · Privacy notice preview"}
    />

    <DetailSection id="privacy-status" title="Privacy Notice" description="A clear statement of what this page can confirm and what remains under legal review.">
      <div className="bma-detail-legal-layout">
        <article className="bma-detail-legal-panel">
          <DetailRibbon warning><strong>Legal approval pending.</strong> This is a preview, not BlinkMyAd's final privacy policy. Verified production practices and legal review are required before this page can serve as an approved notice.</DetailRibbon>
          <h2 className="mt-7">What the platform currently describes</h2>
          <p>Account records may include a name, email address and account role. Driver-partner applications can also contain details entered for onboarding. Sign-in uses a secure session cookie.</p>
          <p>When the verified public enquiry form is available, the submitted contact information and message are sent to the BlinkMyAd server. Public contact details have not been published. Other integrations are available only when configured and enabled.</p>
        </article>
        <aside className="bma-detail-legal-side">
          <ShieldCheck className="mb-4 size-9 text-signal" aria-hidden="true" />
          <h3>Privacy questions?</h3>
          <p>Privacy-related requests and questions can be directed to the BlinkMyAd team through the contact page. The approved notice must describe all applicable rights and procedures.</p>
          <Link href="/contact">Contact about privacy <ArrowUpRight aria-hidden="true" /></Link>
        </aside>
      </div>
    </DetailSection>

    <DetailSection title="How the current flows use information" id="privacy-practices" description="These descriptions are informational and do not replace the eventual legally reviewed policy." tone="blue">
      <DetailCards columns={4} items={[
        { icon: UserRound, title: "Account registration", text: "Basic account details, including name, email address and role, are associated with user profiles." },
        { icon: KeyRound, title: "Account access", text: "Sign-in uses a secure session cookie for authenticated access." },
        { icon: FileText, title: "Driver applications", text: "Vehicle and identity-related application details may be supplied as onboarding steps become available." },
        { icon: Cookie, title: "Optional features", text: "Connected services and integrations operate only when enabled and configured." },
      ]} />
    </DetailSection>

    <DetailSection title="What still needs a reviewed policy" id="privacy-next" description="The final notice must be based on verified production operations rather than assumptions.">
      <div className="bma-detail-stages">
        {[
          { n: "01", title: "Data and service providers", text: "Confirm KYC, payments, analytics, cookies, data flows and recipient disclosures." },
          { n: "02", title: "Retention and protection", text: "Document how long categories of data are kept and how they are secured." },
          { n: "03", title: "Requests and rights", text: "Publish approved contact procedures, user rights and applicable legal conditions." },
        ].map(item => <article key={item.n} className="bma-detail-stage"><strong>{item.n}</strong><div><h3>{item.title}</h3><p>{item.text}</p></div></article>)}
      </div>
      <div className="mt-6"><DetailRibbon>Do not treat this page as a complete or operative policy. Refer to the final published privacy notice when it has been legally approved.</DetailRibbon></div>
    </DetailSection>

    <DetailCTA
      title="Have a question about your data?"
      description="Use the current contact workflow to ask about account information and the privacy review."
      action={{ label: "Contact BlinkMyAd", href: "/contact" }}
      secondaryAction={{ label: "View terms", href: "/terms" }}
    />
  </DetailPage>;
}
