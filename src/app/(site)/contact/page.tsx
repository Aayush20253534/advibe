import type { Metadata } from "next";
import { PageHero, Section } from "@/components/public/marketing-blocks";
import { ContactEnquiry } from "@/components/public/contact-enquiry";

export const metadata: Metadata = {
  title: "Contact AdVibe | Enquiries & Support",
  description:
    "Contact AdVibe about vehicle-screen advertising, campaign planning and driver partnerships in Prayagraj.",
};

// Purpose: get a question to the AdVibe team.
export default function Page() {
  return (
    <>
      <PageHero
        title="Contact AdVibe"
        description="Ask about advertising and driver partnerships in Prayagraj, the first AdVibe launch city."
      />
      <Section>
        <ContactEnquiry />
      </Section>
    </>
  );
}
