import type { Metadata } from "next";
import { PageHero, Section } from "@/components/public/marketing-blocks";
import { ContactEnquiry } from "@/components/public/contact-enquiry";

export const metadata: Metadata = {
  title: "Contact AdVibe | Enquiries & Support",
  description:
    "Prepare an enquiry about AdVibe advertiser campaigns, driver partnerships and screen locations using a contact form.",
};

// Purpose: get a question to the AdVibe team.
export default function Page() {
  return (
    <>
      <PageHero
        title="Contact AdVibe"
        description="Ask about advertising, partnering as a driver or screens in your city."
      />
      <Section>
        <ContactEnquiry />
      </Section>
    </>
  );
}
