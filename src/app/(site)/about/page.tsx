import { publicMetadata } from "@/config/public-metadata";
import { BadgeCheck, Eye, Lock, Scale } from "lucide-react";
import { Benefits, CTA, Heading, PageHero, Section } from "@/components/public/marketing-blocks";

export const metadata = publicMetadata("/about", "About BlinkMyAd | Vision & Mission", "Learn about BlinkMyAd's vision for connecting brands and driver partners through mobile outdoor advertising.");

// Purpose: why BlinkMyAd exists and the principles it works by.
export default function Page() {
  return (
    <>
      <PageHero
        title="About BlinkMyAd"
        description="BlinkMyAd puts advertising on screens carried by everyday vehicles, so local businesses can reach people on the move and drivers can earn from the routes they already drive."
      />
      <Section labelledBy="why">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <Heading id="why" title="Why we're building it" />
            <div className="space-y-4 text-lg text-ink-muted">
              <p>
                Outdoor advertising has mostly meant fixed billboards: expensive, booked for long
                periods and out of reach for small businesses.
              </p>
              <p>
                Screens on vehicles change that. A neighbourhood shop can run a short campaign on
                the routes its customers use, and a driver can add an income without changing how
                they work.
              </p>
            </div>
          </div>
          <div>
            <Heading title="Who it's for" />
            <dl className="divide-y divide-line border-y border-line">
              {[
                ["Advertisers", "Businesses that want local, flexible outdoor campaigns."],
                [
                  "Driver partners",
                  "Bike, auto and car drivers who want to earn from their routes.",
                ],
                ["BlinkMyAd admins", "The team that reviews creatives, campaigns and partners."],
              ].map(([k, v]) => (
                <div key={k} className="grid gap-1 py-4 sm:grid-cols-[10rem_1fr]">
                  <dt className="font-semibold text-ink">{k}</dt>
                  <dd className="text-ink-muted">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Section>
      <Section muted labelledBy="principles">
        <Heading id="principles" title="How we work" />
        <Benefits
          items={[
            {
              title: "Reviewed before it runs",
              text: "Every creative, campaign and driver application is checked by a person before it goes live.",
              icon: BadgeCheck,
            },
            {
              title: "Honest numbers",
              text: "We report what our systems recorded. We don't present estimates or projections as results.",
              icon: Scale,
            },
            {
              title: "Private by default",
              text: "Identity documents are kept in private storage and used for verification.",
              icon: Lock,
            },
            {
              title: "Clear about what's ready",
              text: "Where something is a sample or not available yet, the page says so.",
              icon: Eye,
            },
          ]}
        />
      </Section>
      <CTA
        title="Talk to us"
        text="Questions about advertising, partnering or working with BlinkMyAd?"
        label="Contact BlinkMyAd"
        href="/contact"
      />
    </>
  );
}
