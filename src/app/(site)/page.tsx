import { publicMetadata } from "@/config/public-metadata";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight, ArrowUpRight, CarFront, Check, CheckCheck, ClipboardCheck, MapPin, Megaphone,
  MonitorPlay, Mouse, ShieldCheck,
} from "lucide-react";
import { CampaignTimeline, CinematicHeroArt, IndiaNetworkMap, ScrollReveal } from "@/components/landing/home-motion";
import "@/components/landing/homepage.css";

export const metadata = publicMetadata("/", "Vehicle Screen Advertising in Prayagraj", "BlinkMyAd connects advertisers and driver partners through approved vehicle-screen campaigns, starting in Prayagraj with a platform built for India.");

const valuePoints = [
  { icon: CarFront, title: "Vehicle-mounted advertising", body: "Put your business on display along everyday roads and commutes." },
  { icon: MapPin, title: "Local campaign planning", body: "Choose formats, dates and areas that suit your campaign." },
  { icon: ShieldCheck, title: "Reviewed and approved", body: "Creatives, schedules and screen assignments are checked before launch." },
];

const audiences = [
  {
    eyebrow: "FOR ADVERTISERS", title: "Put your business in motion.",
    description: "Plan a campaign around the people and places that matter to your business.",
    points: ["Choose a screen format", "Select dates and areas", "Submit your campaign for review"],
    image: "/images/audience/advertisers.webp", alt: "Advertiser reviewing a campaign on a laptop",
    href: "/for-advertisers", label: "Explore advertising",
  },
  {
    eyebrow: "FOR DRIVER PARTNERS", title: "Your routes. New possibilities.",
    description: "Learn how approved displays can become part of your regular driving day.",
    points: ["Apply using your vehicle", "Complete required verification", "View assignments in your portal"],
    image: "/images/audience/drivers.webp", alt: "Driver partner standing beside an auto rickshaw",
    href: "/for-drivers", label: "Explore partnerships",
  },
];

const formats = [
  { name: "Bike-mounted screen", description: "Compact advertising behind a rider.", image: "/images/formats/bike-rear.webp", anchor: "bike_rear", alt: "Illustrative rear mounted digital advertising screen on a motorcycle" },
  { name: "Auto rickshaw rear screen", description: "A moving display on everyday routes.", image: "/images/formats/auto-rear.webp", anchor: "auto_rear", alt: "Illustrative display mounted at the rear of an auto rickshaw" },
  { name: "Car interior screen", description: "Advertising viewed from a passenger seat.", image: "/images/formats/car-interior.webp", anchor: "car_interior", alt: "Illustrative digital advertising screen mounted inside a car" },
  { name: "Helmet wrap", description: "A printed placement, not a digital screen.", image: "/images/formats/helmet.webp", anchor: "helmet", alt: "Illustrative printed advertising design on a helmet" },
];

const approval = [
  { icon: Megaphone, title: "Creative review", body: "Campaign artwork is checked before approval." },
  { icon: MonitorPlay, title: "Inventory assignment", body: "Screen availability is verified for the plan." },
  { icon: ClipboardCheck, title: "Schedule approval", body: "Bookings are confirmed after review." },
];

function BlueButton({ href, children, outlined = false }: { href: string; children: React.ReactNode; outlined?: boolean }) {
  return <Link href={href} className={outlined ? "av-button-outline" : "av-button-blue"}>{children}<ArrowUpRight className="size-4 shrink-0" aria-hidden="true" /></Link>;
}

function SectionHeading({ eyebrow, title, description, invert = false }: { eyebrow: string; title: React.ReactNode; description?: string; invert?: boolean }) {
  return <div className="max-w-2xl">
    <p className={invert ? "av-eyebrow text-[#70adff]" : "av-eyebrow text-[#0866FF]"}>{eyebrow}</p>
    <h2 className={invert ? "av-section-title text-white" : "av-section-title text-[#041B3D]"}>{title}</h2>
    <div className="av-underline" aria-hidden="true" />
    {description && <p className={invert ? "mt-6 max-w-xl text-lg leading-8 text-[#c5d5e9]" : "mt-6 max-w-xl text-lg leading-8 text-[#4a5b78]"}>{description}</p>}
  </div>;
}

export default function HomePage() {
  return (
    <>
      <section aria-labelledby="home-title" className="av-hero relative isolate flex min-h-[740px] items-center overflow-hidden bg-[#03152C] text-white">
        <CinematicHeroArt />
        <div className="relative z-10 mx-auto flex w-full max-w-[1280px] items-center px-5 py-28 sm:px-8 lg:min-h-[750px] lg:py-24">
          <div className="max-w-[590px]">
            <ScrollReveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#91b4e2]/45 bg-[#07254b]/75 px-4 py-2 text-xs font-semibold tracking-wide text-[#e5effb] sm:text-sm">
                <MapPin className="size-4 text-[#FF6A00]" aria-hidden="true" /> Starting in Prayagraj · Built for India
              </span>
            </ScrollReveal>
            <ScrollReveal delay={.09}>
              <h1 id="home-title" className="mt-9 font-heading text-[clamp(3.1rem,5.1vw,5.75rem)] font-extrabold leading-[1.04] tracking-[-.035em]">
                Your brand<br />belongs<br /><span className="relative inline-block text-[#FF6A00]">on the move.<span className="av-headline-swash" aria-hidden="true" /></span>
              </h1>
            </ScrollReveal>
            <ScrollReveal delay={.19}>
              <p className="mt-9 max-w-[480px] text-lg leading-8 text-[#e1e9f3]">
                Put your business on digital displays mounted on everyday vehicles. BlinkMyAd connects advertisers, driver partners and local routes, starting with Prayagraj.
              </p>
            </ScrollReveal>
            <ScrollReveal className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center" delay={.29}>
              <BlueButton href="/signup?role=advertiser">Plan a campaign</BlueButton>
              <BlueButton outlined href="/for-drivers">Become a driver partner</BlueButton>
            </ScrollReveal>
            <p className="mt-6 max-w-[475px] text-xs leading-5 text-[#b4c6dd]">All campaigns and screen availability require review. Illustrative vehicle placements; reach and earnings are not guaranteed.</p>
          </div>
        </div>
        <a className="av-scroll-cue absolute bottom-7 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-xs font-medium text-white/85 lg:flex" href="#why-advibe">
          Scroll to explore <Mouse className="size-6" aria-hidden="true" />
        </a>
      </section>

      <section id="why-advibe" className="scroll-mt-24 bg-white py-24 lg:py-30" aria-labelledby="value-title">
        <div className="mx-auto grid max-w-[1280px] items-start gap-12 px-5 sm:px-8 lg:grid-cols-[.8fr_1.45fr] lg:gap-16">
          <ScrollReveal>
            <h2 id="value-title" className="font-heading text-4xl font-extrabold leading-[1.13] tracking-tight text-[#041B3D] sm:text-5xl">Advertising that<br />moves with your city.</h2>
            <div className="av-underline mt-5" aria-hidden="true" />
          </ScrollReveal>
          <div className="grid gap-8 sm:grid-cols-3">
            {valuePoints.map(({ icon: Icon, title, body }, i) => <ScrollReveal key={title} delay={i * .12} className="space-y-4">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-[#e8f0fe] text-[#0866FF]"><Icon className="size-7" aria-hidden="true" /></div>
              <h3 className="font-heading text-xl font-bold leading-snug text-[#041B3D]">{title}</h3>
              <p className="text-sm leading-7 text-[#4a5b78]">{body}</p>
            </ScrollReveal>)}
          </div>
        </div>
      </section>

      <section id="how-it-works" aria-labelledby="process-title" className="relative scroll-mt-22 overflow-hidden bg-[#03152C] py-28 text-white lg:py-34">
        <div className="pointer-events-none absolute left-[-15%] right-[-15%] top-1/2 h-[380px] rotate-[-9deg] border-t-2 border-[#FF6A00]/20 [box-shadow:0_-7px_42px_rgba(255,106,0,.12)]" aria-hidden="true" />
        <div className="relative mx-auto max-w-[1280px] px-5 sm:px-8">
          <ScrollReveal><div className="text-center"><p className="av-eyebrow text-[#79b4ff]">HOW BLINKMYAD WORKS</p><h2 id="process-title" className="mx-auto mt-5 max-w-3xl font-heading text-4xl font-extrabold tracking-tight sm:text-5xl">From idea to approved campaign.</h2><div className="av-underline mx-auto mt-6" aria-hidden="true" /></div></ScrollReveal>
          <CampaignTimeline />
          <p className="mt-10 text-center text-sm text-[#b4c6dd]">Illustrative workflow. Playback and driver earnings depend on approved assignments and platform verification.</p>
        </div>
      </section>

      <section id="audiences" aria-labelledby="audiences-title" className="bg-white py-28 lg:py-34">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
          <ScrollReveal><SectionHeading eyebrow="ONE PLATFORM, TWO SIDES" title={<>Built for both sides<br />of the road.</>} /></ScrollReveal>
          <div className="mt-14 grid gap-8 lg:grid-cols-2">
            {audiences.map((item, i) => <ScrollReveal direction={i === 0 ? "left" : "right"} key={item.title}>
              <article className="group relative isolate flex min-h-[470px] flex-col justify-end overflow-hidden rounded-[26px] border border-[#dce4f0] bg-[#f3f8ff] shadow-[0_12px_40px_rgba(4,27,61,.06)] transition-shadow duration-300 hover:shadow-[0_20px_58px_rgba(4,27,61,.12)] sm:min-h-[530px]">
                <Image src={item.image} alt={item.alt} fill sizes="(max-width: 1024px) 100vw, 600px" className="-z-10 object-cover object-center transition-transform duration-700 group-hover:scale-[1.035]" />
                <div className="absolute inset-0 -z-10 bg-[linear-gradient(0deg,#ffffff_0%,rgba(255,255,255,.97)_34%,rgba(255,255,255,.10)_93%)]" />
                <div className="p-7 sm:p-9">
                  <span className="av-eyebrow text-[#0866FF]">{item.eyebrow}</span>
                  <h3 className="mt-3 max-w-[440px] font-heading text-3xl font-extrabold leading-tight text-[#041B3D]">{item.title}</h3>
                  <p className="mt-3 max-w-[400px] text-sm leading-6 text-[#4a5b78]">{item.description}</p>
                  <ul className="mt-5 space-y-2">{item.points.map(point => <li key={point} className="flex items-start gap-2 text-sm text-[#041B3D]"><Check className="mt-0.5 size-4 shrink-0 text-[#FF6A00]" aria-hidden="true" />{point}</li>)}</ul>
                  <Link href={item.href} className="av-button-blue mt-7">{item.label}<ArrowUpRight className="size-4" aria-hidden="true" /></Link>
                </div>
              </article>
            </ScrollReveal>)}
          </div>
        </div>
      </section>

      <section id="formats" aria-labelledby="formats-title" className="scroll-mt-24 bg-[#03152C] py-28 text-white lg:py-34">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
          <ScrollReveal><div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end"><SectionHeading eyebrow="AD FORMATS" invert title={<>Choose the screen.<br />Shape the campaign.</>} description="Explore advertising placements designed for everyday vehicles. Availability depends on verified hardware and approved inventory." /><BlueButton href="/ad-formats" outlined>Compare all formats</BlueButton></div></ScrollReveal>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {formats.map((format, i) => <ScrollReveal delay={i * .09} key={format.anchor}>
              <Link href={`/ad-formats#${format.anchor}`} className="group block h-full overflow-hidden rounded-2xl border border-[#315174] bg-[#09284C] transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-[#408fff] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff8a37]">
                <div className="relative aspect-[1.15] overflow-hidden bg-[#183f69]"><Image src={format.image} alt={format.alt} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px" className="object-cover transition-transform duration-700 group-hover:scale-105" /></div>
                <div className="p-5"><div className="flex items-start justify-between gap-2"><h3 className="font-heading text-lg font-bold text-white">{format.name}</h3><ArrowUpRight className="mt-1 size-4 shrink-0 text-[#ff8a37] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" /></div><p className="mt-3 text-sm leading-6 text-[#c3d0e4]">{format.description}</p></div>
              </Link>
            </ScrollReveal>)}
          </div>
        </div>
      </section>

      <section id="india-coverage" aria-labelledby="india-title" className="scroll-mt-24 bg-[#f5f8fc] py-28 lg:py-36">
        <div className="mx-auto grid max-w-[1280px] items-center gap-14 px-5 sm:px-8 lg:grid-cols-[.8fr_1.2fr] lg:gap-20">
          <ScrollReveal>
            <SectionHeading eyebrow="INDIA-WIDE VISION" title={<>Starting local.<br />Built to go further.</>} description="BlinkMyAd is beginning in Prayagraj, with a platform designed for vehicle-based advertising across India." />
            <div className="mt-8 flex items-center gap-3 rounded-xl border border-[#dce4f0] bg-white px-5 py-4 text-sm text-[#041B3D]"><MapPin className="size-5 shrink-0 text-[#FF6A00]" aria-hidden="true" /><span><strong>Prayagraj</strong> is the initial launch city. Other locations are not verified as active.</span></div>
            <div className="mt-8"><BlueButton href="/locations">Explore locations</BlueButton></div>
          </ScrollReveal>
          <ScrollReveal delay={.12}><IndiaNetworkMap /></ScrollReveal>
        </div>
      </section>

      <section id="review" aria-labelledby="review-title" className="bg-white py-28 lg:py-34">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
          <ScrollReveal><div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end"><SectionHeading eyebrow="BUILT WITH ACCOUNTABILITY" title="Reviewed before it runs." description="A campaign draft is not a confirmed booking. Creatives, inventory and schedules must pass review before activation." /><Link href="/for-advertisers" className="inline-flex min-h-11 items-center gap-2 self-start font-semibold text-[#0866FF] hover:underline">How campaigns work <ArrowRight className="size-4" aria-hidden="true" /></Link></div></ScrollReveal>
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {approval.map(({ icon: Icon, title, body }, i) => <ScrollReveal delay={i * .13} key={title}><article className="relative h-full rounded-[22px] border border-[#dce4f0] bg-[#f5f8fc] p-8 sm:p-10"><div className="mb-8 flex size-16 items-center justify-center rounded-2xl border border-[#cae0ff] bg-[#e8f0fe] text-[#0866FF]"><Icon className="size-8" aria-hidden="true" /></div><span className="text-sm font-bold tracking-widest text-[#0866FF]">0{i + 1}</span><h3 className="mt-3 font-heading text-2xl font-bold text-[#041B3D]">{title}</h3><p className="mt-4 text-base leading-7 text-[#4a5b78]">{body}</p><CheckCheck className="absolute right-8 top-9 size-6 text-[#FF6A00]" aria-hidden="true" /></article></ScrollReveal>)}
          </div>
        </div>
      </section>

      <section id="start" aria-labelledby="start-title" className="relative isolate overflow-hidden bg-[#03152C] py-28 text-white lg:py-36">
        <Image src="/images/cta/closing-road.webp" alt="" fill sizes="100vw" className="-z-20 object-cover object-center" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,#03152cf5_0%,#03152ce8_39%,#03152c29_100%)]" aria-hidden="true" />
        <div className="relative mx-auto max-w-[1280px] px-5 sm:px-8"><ScrollReveal>
          <h2 id="start-title" className="max-w-[690px] font-heading text-[clamp(2.8rem,5vw,5.5rem)] font-extrabold leading-[1.08] tracking-tight">Take your brand <span className="text-[#FF6A00]">further.</span></h2>
          <div className="av-underline mt-5" aria-hidden="true" />
          <p className="mt-7 max-w-[600px] text-lg leading-8 text-[#d8e4f2]">Start planning an BlinkMyAd campaign or explore becoming a driver partner.</p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row"><BlueButton href="/signup?role=advertiser">Create an advertiser account</BlueButton><BlueButton outlined href="/for-drivers">Become a driver partner</BlueButton></div>
        </ScrollReveal></div>
      </section>
    </>
  );
}
