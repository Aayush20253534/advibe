import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BadgeCheck,
  CarFront,
  Check,
  ChevronDown,
  CloudUpload,
  Coins,
  Eye,
  Layers3,
  LockKeyhole,
  MapPin,
  Megaphone,
  MonitorPlay,
  Route,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { publicMetadata } from "@/config/public-metadata";
import "./how-it-works.css";

export const metadata = publicMetadata(
  "/how-it-works",
  "How BlinkMyAd Works | Advertiser & Driver Guide",
  "See how advertisers plan and submit vehicle-screen campaigns, how driver partners apply, and how BlinkMyAd reviews campaigns, verifies placements and reports activity.",
);

const bigPicture = [
  { number: "01", icon: Layers3, title: "Choose a format", text: "Pick the right vehicle placement for your goal and audience." },
  { number: "02", icon: CloudUpload, title: "Create or upload your creative", text: "Use a ready design or upload your own image or video." },
  { number: "03", icon: ShieldCheck, title: "Get reviewed and approved", text: "Our team checks your creative for policy and quality." },
  { number: "04", icon: MonitorPlay, title: "Go live and track results", text: "Approved campaigns run on verified vehicles, with clear reporting." },
];

const advertiserJourney = [
  { title: "Pick a vehicle format", text: "Choose from auto, bike, car and more." },
  { title: "Select routes / city reach", text: "Target the routes, areas or city coverage that fit your goal." },
  { title: "Upload creative files", text: "Add your image or video in the required format." },
  { title: "Admin review and scheduling", text: "We review your creative and schedule the campaign." },
  { title: "Launch and monitor campaign", text: "Once approved and available, track campaign activity in your dashboard." },
];

const driverJourney = [
  { title: "Sign up and apply", text: "Create an account as a driver partner." },
  { title: "Submit vehicle and identity details", text: "Share your vehicle information and ID for verification when requested." },
  { title: "Verification and approval", text: "Our team checks your details and confirms eligibility." },
  { title: "Install or activate placement", text: "Get the screen installed or activate the assigned placement, when available." },
  { title: "Start earning on active routes", text: "Drive your regular routes and earn for eligible verified campaigns." },
];

const detailedWorkflow = [
  { icon: CarFront, image: "/images/blinkmyad/ad-formats/auto-rear.webp", title: "Discover formats", text: "Explore vehicle-screen options like auto, bike, car and more." },
  { icon: MapPin, title: "Estimate fit", text: "See expected reach, routes and cost for your chosen format." },
  { icon: CloudUpload, title: "Upload creatives", text: "Add your ad image or video in the right specs." },
  { icon: ShieldCheck, title: "Compliance review", text: "Our team reviews your creative for content and policy compliance." },
  { icon: MonitorPlay, title: "Campaign goes live", text: "Your ad runs on verified vehicles across the selected routes." },
  { icon: BarChart3, title: "Reporting and optimization", text: "Track recorded performance, view insights and optimize future campaigns." },
];

const trust = [
  { icon: BadgeCheck, title: "Reviewed before it runs", text: "Every creative, campaign and driver application is checked by a person." },
  { icon: BadgeCheck, title: "Honest numbers", text: "We report what our systems recorded. No inflated estimates or projections." },
  { icon: LockKeyhole, title: "Private by default", text: "Your documents are kept secure and used only for verification." },
  { icon: Eye, title: "Clear about what's ready", text: "We clearly indicate what's confirmed, in review or not available yet." },
];

const benefits = [
  { icon: MapPin, title: "Local visibility", text: "Reach people on real, everyday routes in your target areas." },
  { icon: Coins, title: "Flexible budgets", text: "Run focused local campaigns or scale across more routes." },
  { icon: Route, title: "Route-based reach", text: "Put your brand in front of people where they actually travel." },
  { icon: Wallet, title: "Driver earning opportunities", text: "A simple, verified way for drivers to earn from their regular routes." },
];

const questions = [
  {
    q: "How long does approval take?",
    a: "Every creative and campaign receives a human review. Timing depends on the submission, the required checks and current review volume. Your portal will show its latest recorded status.",
  },
  {
    q: "What creative formats are accepted?",
    a: "Requirements depend on the placement. Choose a vehicle-screen format to view the accepted dimensions and file specifications before you upload an image or video.",
  },
  {
    q: "How are routes selected?",
    a: "Advertisers can plan their target city or area, but final routes and schedules depend on published coverage, verified driver inventory and campaign approval.",
  },
  {
    q: "How do driver partners earn?",
    a: "Eligible partners may earn for verified delivery on approved campaigns under the applicable driver agreement. Actual earning terms are confirmed before activation.",
  },
  {
    q: "Can campaigns run in one city first?",
    a: "Yes. Advertisers can plan a locally focused campaign. BlinkMyAd is starting with Prayagraj; actual screen and route availability is confirmed before booking.",
  },
];

function Journey({
  title,
  subtitle,
  icon: Icon,
  steps,
  image,
  alt,
  variant,
}: {
  title: string;
  subtitle: string;
  icon: typeof Megaphone;
  steps: typeof advertiserJourney;
  image: string;
  alt: string;
  variant: "advertiser" | "driver";
}) {
  return (
    <article className={"bma-how-journey bma-how-journey-" + variant}>
      <header className="bma-how-journey-heading">
        <Icon aria-hidden="true" />
        <div>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
      </header>
      <div className="bma-how-journey-body">
        <div className="bma-how-journey-photo">
          <Image src={image} alt={alt} fill sizes="(max-width: 680px) 80vw, (max-width: 1100px) 35vw, 18vw" />
        </div>
        <ol className="bma-how-timeline">
          {steps.map((step, i) => (
            <li key={step.title}>
              <span className={"bma-how-timeline-marker" + (i === steps.length - 1 ? " is-last" : "")} aria-hidden="true">
                {i === steps.length - 1 && <Check />}
              </span>
              <div>
                <h4>{step.title}</h4>
                <p>{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </article>
  );
}

export default function HowItWorksPage() {
  return (
    <div className="bma-how">
      <section className="bma-how-hero" aria-labelledby="how-title">
        <div className="bma-how-shell bma-how-hero-inner">
          <div className="bma-how-hero-copy">
            <h1 id="how-title">How BlinkMyAd works</h1>
            <p>BlinkMyAd helps advertisers launch vehicle-screen campaigns and helps driver partners earn through verified routes.</p>
            <div className="bma-how-hero-buttons">
              <Link className="bma-how-button bma-how-button-blue" href="/signup?role=advertiser">
                Start a campaign <ArrowUpRight aria-hidden="true" />
              </Link>
              <Link className="bma-how-button bma-how-button-outline" href="/signup?role=driver">
                Become a driver partner
              </Link>
            </div>
            <ul className="bma-how-hero-points" aria-label="What matters to BlinkMyAd">
              <li><BadgeCheck aria-hidden="true" /><span>Human-reviewed<br />campaigns</span></li>
              <li><MapPin aria-hidden="true" /><span>Flexible<br />local reach</span></li>
              <li><BarChart3 aria-hidden="true" /><span>Transparent<br />reporting</span></li>
            </ul>
          </div>
          <div className="bma-how-hero-visual">
                    <Image
                      src="/images/hero/img.png"
                      alt="BlinkMyAd campaign workflow with advertising screens on a scooter, auto-rickshaw and car, set against a city roadway and campaign dashboards"
                      fill
                      priority
                      unoptimized
                      sizes="(max-width: 620px) 100vw, (max-width: 900px) 72vw, 68vw"
                      className="bma-how-hero-image"
                    />
                  </div>
        </div>
      </section>

      <div className="bma-how-shell">
        <section className="bma-how-section bma-how-overview" aria-labelledby="how-overview-title">
          <div className="bma-how-section-heading">
            <h2 id="how-overview-title">The big picture: from idea to live campaign</h2>
            <p>A simple, end-to-end flow for advertisers and driver partners.</p>
          </div>
          <ol className="bma-how-overview-grid">
            {bigPicture.map(({ number, icon: Icon, title, text }) => (
              <li className="bma-how-overview-card" key={number}>
                <div className="bma-how-overview-top">
                  <span className="bma-how-step-number">{number}</span>
                  <Icon aria-hidden="true" />
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="bma-how-journeys" aria-label="How the platform works for each participant">
          <Journey
            title="For advertisers"
            subtitle="Plan, launch and measure vehicle-screen campaigns in a few clear steps."
            icon={Megaphone}
            steps={advertiserJourney}
            image="/images/blinkmyad/ad-formats/auto-rear.webp"
            alt="Auto-rickshaw with a rear digital advertising screen"
            variant="advertiser"
          />
          <Journey
            title="For driver partners"
            subtitle="Turn your everyday routes into an additional, verified income opportunity."
            icon={CarFront}
            steps={driverJourney}
            image="/images/blinkmyad/ad-formats/car-interior.webp"
            alt="Rear-seat digital screen mounted inside a car"
            variant="driver"
          />
        </section>

        <section className="bma-how-section bma-how-detailed" aria-labelledby="workflow-title">
          <div className="bma-how-section-heading">
            <h2 id="workflow-title">A closer look at the campaign workflow</h2>
            <p>From choosing a format to improving results, here&apos;s how a campaign moves through the platform.</p>
          </div>
          <ol className="bma-how-detailed-grid">
            {detailedWorkflow.map(({ icon: Icon, image, title, text }) => (
              <li className="bma-how-detail-card" key={title}>
                <div className="bma-how-detail-illustration">
                  {image ? <Image src={image} alt="" width={110} height={78} /> : <Icon aria-hidden="true" />}
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="bma-how-trust" aria-labelledby="trust-title">
          <h2 id="trust-title">Built for trust,<br />safety and quality</h2>
          <div className="bma-how-trust-grid">
            {trust.map(({ icon: Icon, title, text }) => (
              <article className="bma-how-trust-card" key={title}>
                <Icon aria-hidden="true" />
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="bma-how-section bma-how-benefits" aria-labelledby="benefits-title">
          <div className="bma-how-section-heading">
            <h2 id="benefits-title">Why it works for everyone</h2>
            <p>A simple marketplace that creates visibility for brands and earning opportunities for drivers.</p>
          </div>
          <div className="bma-how-benefits-grid">
            {benefits.map(({ icon: Icon, title, text }) => (
              <article className="bma-how-benefit-card" key={title}>
                <Icon aria-hidden="true" />
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="bma-how-faq" aria-labelledby="how-faq-title">
          <div className="bma-how-faq-heading">
            <h2 id="how-faq-title">Common<br />questions</h2>
            <p>Quick answers to the most frequent questions about how BlinkMyAd works.</p>
          </div>
          <div className="bma-how-faq-list">
            {questions.map(({ q, a }) => (
              <details key={q}>
                <summary>
                  <span>{q}</span><ChevronDown aria-hidden="true" />
                </summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>

      <section className="bma-how-final" aria-labelledby="how-final-title">
        <div className="bma-how-final-art" aria-hidden="true">
          <Image src="/images/blinkmyad/auto.webp" alt="" fill unoptimized sizes="(max-width: 720px) 0px, 360px" />
        </div>
        <div className="bma-how-final-copy">
          <h2 id="how-final-title">Ready to launch your first<br />moving campaign?</h2>
          <p>Get your brand on vehicle screens, reach real people on real routes and see measurable results.</p>
        </div>
        <div className="bma-how-final-buttons">
          <Link href="/signup?role=advertiser" className="bma-how-button bma-how-button-white">
            Create a campaign <ArrowUpRight aria-hidden="true" />
          </Link>
          <Link href="/contact" className="bma-how-button bma-how-button-ghost">
            Talk to sales
          </Link>
        </div>
      </section>
    </div>
  );
}
