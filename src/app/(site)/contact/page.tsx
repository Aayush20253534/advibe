import { publicMetadata } from "@/config/public-metadata";
import { PageHero, Section } from "@/components/public/marketing-blocks";
import { ContactEnquiry } from "@/components/public/contact-enquiry";

export const metadata = publicMetadata("/contact", "Contact BlinkMyAd | Enquiries & Support", "Contact BlinkMyAd about vehicle-screen advertising, campaign planning and driver partnerships in Prayagraj.");

// Purpose: get a question to the BlinkMyAd team.
export default function Page() {
  return (
    <>
      <PageHero
        title="Contact BlinkMyAd"
        description="Ask about advertising and driver partnerships in Prayagraj, the first BlinkMyAd launch city."
      />
      <Section>
        <ContactEnquiry />
      </Section>
    </>
  );
}
