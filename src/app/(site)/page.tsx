import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { RouteLine } from "@/components/landing/route-line";
import { CoverageExplorer } from "@/components/landing/coverage-explorer";
import {
  CTA,
  FormatsGrid,
  Heading,
  Section,
  outlineButton,
  secondaryButton,
} from "@/components/public/marketing-blocks";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Outdoor & Mobile Advertising on Every Journey",
  description:
    "Explore AdVibe vehicle-screen advertising for brands and an earning opportunity for driver partners. Choose locations, ad formats and launch targeted campaigns.",
  openGraph: {
    title: "AdVibe | Your Brand. Their Journey. Everywhere.",
    description:
      "Mobile outdoor advertising for brands and driver partners across everyday journeys.",
    type: "website",
  },
};

// Beacon is reserved for the main marketing call to action, always with ink text.
const heroCTA =
  "inline-flex min-h-12 items-center justify-center rounded-lg bg-brand-orange text-brand-navy px-6 text-base font-semibold transition-colors hover:bg-beacon-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

const paths = [
  {
    title: "For advertisers",
    lead: "Run local campaigns on screens that travel your customers' routes.",
    points: [
      "Choose the format, area, dates and hours",
      "Start with a free draft",
      "An admin reviews it before it runs",
    ],
    href: "/for-advertisers",
    link: "How advertising works",
  },
  {
    title: "For driver partners",
    lead: "Carry a screen on your bike, auto or car and earn from your usual routes.",
    points: [
      "Apply and upload your documents online",
      "Screen installed after you are approved",
      "Earnings and payouts shown in your portal",
    ],
    href: "/for-drivers",
    link: "How partnering works",
  },
];

export default function HomePage() {
  return (
    <>
      <section aria-labelledby="hero-title" className="bg-night text-white">
        <div className="mx-auto max-w-7xl px-4 pt-14 pb-16 sm:px-6 sm:pt-20 lg:pb-20">
          <div className="max-w-3xl">
            <h1 id="hero-title" className="font-heading text-4xl font-bold sm:text-5xl lg:text-6xl">
              Your ad, on screens that move through your city
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-[#c3d0e4]">
              AdVibe puts advertising on digital screens carried by bikes, auto rickshaws and cars.
              Businesses reach people on the move, and drivers earn from the routes they already
              drive.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/signup?role=advertiser" className={heroCTA}>
                Start advertising
              </Link>
              <Link href="/signup?role=driver" className={secondaryButton}>
                Become a driver partner
              </Link>
            </div>
          </div>
          <div className="mt-16 border-t border-white/15 pt-10">
            <h2 className="sr-only">How a campaign moves through AdVibe</h2>
            <RouteLine />
          </div>
        </div>
      </section>

      <Section labelledBy="paths-title">
        <Heading id="paths-title" title="Two ways to use AdVibe" />
        <div className="grid gap-px overflow-hidden rounded-lg border border-line bg-line md:grid-cols-2">
          {paths.map((p) => (
            <div key={p.title} className="flex flex-col bg-surface p-6 sm:p-8">
              <h3 className="font-heading text-xl font-semibold text-ink">{p.title}</h3>
              <p className="mt-2 text-lg text-ink-muted">{p.lead}</p>
              <ul className="mt-5 space-y-2">
                {p.points.map((point) => (
                  <li key={point} className="flex items-start gap-2 text-base text-ink">
                    <Check className="mt-1 size-4 shrink-0 text-success-fg" aria-hidden />
                    {point}
                  </li>
                ))}
              </ul>
              <Link href={p.href} className={cn(outlineButton, "mt-8 self-start")}>
                {p.link}
              </Link>
            </div>
          ))}
        </div>
      </Section>

      <Section muted labelledBy="formats-title">
        <Heading
          id="formats-title"
          title="Where your ad can appear"
          description="Four placements, each seen by a different audience."
          action={{ label: "Compare formats", href: "/ad-formats" }}
        />
        <FormatsGrid />
      </Section>

      <CoverageExplorer />

      <CTA
        title="Start with a free campaign draft"
        text="Create an account, upload a creative and plan your dates. Nothing runs until it has been reviewed."
        label="Start advertising"
        href="/signup?role=advertiser"
      />
    </>
  );
}
