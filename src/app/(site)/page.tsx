import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check, MapPin, ShieldCheck } from "lucide-react";
import { RouteLine } from "@/components/landing/route-line";
import { CoverageExplorer } from "@/components/landing/coverage-explorer";
import { CTA, FormatsGrid, Heading, Section } from "@/components/public/marketing-blocks";

export const metadata: Metadata = {
  title: "Vehicle Screen Advertising in Prayagraj | AdVibe",
  description: "Plan digital vehicle-screen campaigns in Prayagraj. Explore bike, auto and car formats, advertiser campaigns and driver partnerships with AdVibe.",
  openGraph: {
    title: "AdVibe | Vehicle Advertising in Prayagraj",
    description: "A local-first vehicle-screen advertising platform, launching in Prayagraj.",
    type: "website",
  },
};

const journeys = [
  {
    number: "01",
    title: "For local businesses",
    description: "Plan a campaign around the people and places that matter to your business.",
    points: ["Choose a screen format", "Select dates and areas", "Submit your campaign for review"],
    href: "/for-advertisers",
    action: "Explore advertising",
  },
  {
    number: "02",
    title: "For driver partners",
    description: "Explore how approved screens can become part of your everyday driving route.",
    points: ["Apply with your vehicle", "Complete required verification", "View assignments in your portal"],
    href: "/for-drivers",
    action: "Explore partnerships",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden bg-night text-white" aria-labelledby="hero-title">
        <div className="pointer-events-none absolute inset-0 opacity-30" aria-hidden="true" style={{ backgroundImage: "radial-gradient(circle at 80% 15%, #0866ff 0, transparent 48%)" }} />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 pb-14 pt-14 sm:px-6 sm:pt-20 lg:grid-cols-[1.04fr_0.96fr] lg:items-center lg:gap-14 lg:pb-20">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-3 py-1.5 text-sm font-medium text-white">
              <MapPin className="size-4 text-beacon" aria-hidden="true" />
              Starting in Prayagraj, Uttar Pradesh
            </span>
            <h1 id="hero-title" className="mt-7 font-heading text-[2.65rem] font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.65rem]">
              Your brand belongs <span className="text-[#ffb077]">on the move.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#c3d0e4]">
              Put your business on digital displays mounted on everyday vehicles.
              AdVibe connects advertisers, driver partners and local routes, starting with Prayagraj.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/signup?role=advertiser" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-beacon px-6 font-semibold text-ink hover:bg-beacon-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                Plan a campaign <ArrowUpRight className="size-4" aria-hidden="true" />
              </Link>
              <Link href="/for-drivers" className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/45 px-6 font-semibold text-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                Become a driver partner
              </Link>
            </div>
            <p className="mt-5 text-sm text-[#c3d0e4]">
              Campaigns and screen availability require AdVibe review. No unverified reach or earnings promised.
            </p>
          </div>
          <div className="relative" aria-label="Examples of AdVibe vehicle-screen formats">
            <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/10 p-2 shadow-2xl sm:p-3">
              <div className="relative aspect-[1.28/1] overflow-hidden rounded-xl bg-[#0e2b51]">
                <Image src="/images/formats/auto-rear.webp" alt="Illustrative rear display on an auto rickshaw" fill priority sizes="(max-width: 1024px) 100vw, 46vw" className="object-cover" />
              </div>
              <div className="flex items-center justify-between gap-3 px-2 pb-1 pt-3 text-sm">
                <span className="font-semibold">Advertising that travels</span>
                <span className="text-[#c3d0e4]">Illustrative placement</span>
              </div>
            </div>
            <div className="absolute -bottom-6 -left-3 hidden w-44 overflow-hidden rounded-xl border-4 border-night bg-white shadow-xl sm:block lg:-left-9">
              <div className="relative aspect-[4/3]">
                <Image src="/images/formats/car-interior.webp" alt="Illustrative car interior ad screen" fill sizes="176px" className="object-cover" />
              </div>
              <p className="px-3 py-2 text-xs font-semibold text-ink">More than one format</p>
            </div>
          </div>
        </div>
        <div className="relative mx-auto max-w-7xl border-t border-white/15 px-4 py-8 sm:px-6">
          <h2 className="mb-5 text-xs font-semibold uppercase tracking-[.15em] text-[#c3d0e4]">From idea to approved campaign</h2>
          <RouteLine />
        </div>
      </section>

      <Section labelledBy="choose-path">
        <Heading id="choose-path" title="Built for both sides of the road" description="One platform for the businesses that want visibility and the drivers who carry the screens." />
        <div className="grid gap-5 lg:grid-cols-2">
          {journeys.map((journey) => (
            <article key={journey.number} className="group flex h-full flex-col rounded-xl border border-line bg-surface p-6 transition-colors hover:border-signal sm:p-8">
              <span className="text-sm font-bold tracking-widest text-signal">{journey.number} / ADVIBE</span>
              <h3 className="mt-5 font-heading text-2xl font-bold text-ink">{journey.title}</h3>
              <p className="mt-3 max-w-lg leading-7 text-ink-muted">{journey.description}</p>
              <ul className="mt-6 space-y-3">
                {journey.points.map((point) => (
                  <li key={point} className="flex items-start gap-3 text-sm text-ink">
                    <Check className="mt-0.5 size-4 shrink-0 text-success-fg" aria-hidden="true" /> {point}
                  </li>
                ))}
              </ul>
              <Link href={journey.href} className="mt-8 inline-flex min-h-11 items-center gap-2 self-start font-semibold text-signal underline-offset-4 hover:underline">
                {journey.action} <ArrowUpRight className="size-4" aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      </Section>

      <Section muted labelledBy="formats-title">
        <Heading id="formats-title" title="Choose the screen. Shape the campaign." description="Compare example placements before preparing your creative. Actual hardware availability is confirmed in the platform." action={{ label: "Compare all formats", href: "/ad-formats" }} />
        <FormatsGrid />
      </Section>

      <CoverageExplorer />

      <section className="border-y border-line bg-paper">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-1 size-7 shrink-0 text-signal" aria-hidden="true" />
            <div>
              <h2 className="font-heading text-xl font-bold text-ink">Reviewed before it runs</h2>
              <p className="mt-1 max-w-2xl text-ink-muted">A campaign draft is not a confirmed booking. Creatives, inventory and schedules are reviewed before activation.</p>
            </div>
          </div>
          <Link className="inline-flex min-h-11 shrink-0 items-center gap-2 font-semibold text-signal hover:underline" href="/for-advertisers">
            How campaigns work <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
      <CTA title="Start in Prayagraj" text="Build a draft, explore the formats and plan a local campaign. We confirm inventory and rates before anything is booked." label="Create an advertiser account" href="/signup?role=advertiser" />
    </>
  );
}
