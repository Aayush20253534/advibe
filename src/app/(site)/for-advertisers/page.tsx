import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ImageUp,
  Info,
  Target,
  UserRound,
  UsersRound,
  Wallet,
} from "lucide-react";
import { publicMetadata } from "@/config/public-metadata";
import "./for-advertisers.css";

export const metadata = publicMetadata(
  "/for-advertisers",
  "For Advertisers | Advertise on Vehicle Screens with BlinkMyAd",
  "Discover how BlinkMyAd helps advertisers plan vehicle-screen campaigns in Prayagraj, choose placements, upload creatives, and submit campaigns for review.",
);

const advantages = [
  { icon: UsersRound, title: "Seen on everyday routes", text: "Screens travel the roads people use to commute, shop and run errands, not a single fixed billboard spot." },
  { icon: Target, title: "You choose where and when", text: "Plan for Prayagraj: choose a screen format, dates, daily hours and days of the week." },
  { icon: Wallet, title: "Small budgets work", text: "Pricing is per screen, per day, so a short local campaign is possible without a large commitment." },
  { icon: BadgeCheck, title: "Reviewed before it runs", text: "Every creative and every campaign is checked by a BlinkMyAd admin before it is scheduled." },
];

const steps = [
  { icon: UserRound, title: "Create your account", text: "Register as an advertiser and add your business." },
  { icon: ImageUp, title: "Upload a creative", text: "Upload your image or video. An admin checks it against the screen specifications." },
  { icon: CalendarDays, title: "Build a campaign draft", text: "Choose dates, daily hours and days. Drafts are free and can be changed." },
  { icon: CheckCircle2, title: "Submit for review", text: "A BlinkMyAd admin approves the campaign before anything is scheduled." },
];

const formats = [
  {
    title: "Bike-mounted screen",
    description: "A compact screen behind the rider, seen by traffic and people on the street.",
    src: "/images/blinkmyad/ad-formats/bike-rear.webp",
    alt: "Bike-mounted BlinkMyAd advertising screen",
  },
  {
    title: "Auto rickshaw rear screen",
    description: "A rear-facing screen on autos that travel the same local routes every day.",
    src: "/images/blinkmyad/ad-formats/auto-rear.webp",
    alt: "BlinkMyAd display mounted to the back of an auto rickshaw",
  },
  {
    title: "Car interior screen",
    description: "A seat-back screen that passengers see for the length of their ride.",
    src: "/images/blinkmyad/ad-formats/car-interior.webp",
    alt: "BlinkMyAd passenger-facing display on a car seat back",
  },
];

const faqs = [
  {
    question: "How can I book an advertising campaign?",
    answer: "Create an advertiser account, add your business and upload a creative. Build a campaign draft with your desired dates, hours and placement. Every submission is reviewed and availability and pricing are confirmed before booking.",
  },
  {
    question: "What types of vehicle screens are available?",
    answer: "The planned formats include bike-mounted screens, auto-rickshaw rear screens and car interior screens. Actual bookable placements depend on verified inventory and supported locations.",
  },
  {
    question: "How is the pricing calculated?",
    answer: "Pricing depends on screen placement, location, number of screens, dates, creative duration and delivery settings. Estimates are illustrative until your campaign is reviewed and confirmed.",
  },
  {
    question: "How and when do drivers receive payments?",
    answer: "Driver payouts are governed by verified campaign activity and individual partner agreements. Advertisers pay for confirmed campaigns under the applicable booking terms.",
  },
  {
    question: "Can I change or pause a campaign?",
    answer: "Draft campaigns can be edited before submission. Changes to submitted or approved campaigns depend on their status and may require another review or an updated schedule.",
  },
];

export default function ForAdvertisersPage() {
  return (
    <div className="bma-advertisers">
      <section className="bma-advertisers-hero" aria-labelledby="advertisers-title">
        <div className="bma-advertisers-hero-art" aria-hidden="true">
          <Image src="/images/blinkmyad/fleet.webp" alt="" fill priority sizes="(max-width: 680px) 100vw, 66vw" />
        </div>
        <div className="bma-advertisers-hero-car" aria-hidden="true">
          <Image src="/images/blinkmyad/ad-formats/car-interior.webp" alt="" fill sizes="(max-width: 680px) 0px, 20vw" />
        </div>
        <div className="bma-advertisers-shell bma-advertisers-hero-inner">
          <div className="bma-advertisers-hero-copy">
            <span className="bma-advertisers-eyebrow"><span aria-hidden="true" />For advertisers</span>
            <h1 id="advertisers-title">Make your next<br />move visible.</h1>
            <p>Plan locally relevant advertising using digital screens on bikes, autos and cars in Prayagraj. Choose a format and schedule, then submit your creative for review. Availability is confirmed before booking.</p>
            <div className="bma-advertisers-hero-actions">
              <Link href="/signup?role=advertiser" className="bma-advertisers-button bma-advertisers-button-primary">Create an advertiser account</Link>
              <Link href="/pricing" className="bma-advertisers-button bma-advertisers-button-outline">Estimate the cost</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bma-advertisers-section bma-advertisers-advantages" aria-labelledby="adv-why">
        <div className="bma-advertisers-shell">
          <h2 id="adv-why">Why advertise on vehicle screens</h2>
          <div className="bma-advertisers-advantages-grid">
            {advantages.map(({ icon: Icon, title, text }) => (
              <article className="bma-advertisers-advantage" key={title}>
                <span className="bma-advertisers-icon"><Icon aria-hidden="true" /></span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bma-advertisers-process" aria-labelledby="adv-process">
        <div className="bma-advertisers-shell">
          <div className="bma-advertisers-heading">
            <h2 id="adv-process">How a campaign runs</h2>
            <p>Four steps from sign-up to an approved campaign.</p>
          </div>
          <ol className="bma-advertisers-steps">
            {steps.map(({ icon: Icon, title, text }, index) => (
              <li key={title} className="bma-advertisers-step">
                <div className="bma-advertisers-step-top"><Icon aria-hidden="true" /><span>Step {index + 1}</span></div>
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ol>
          <p className="bma-advertisers-note"><Info aria-hidden="true" />Drafts are free. Nothing is booked or charged when you create or save a campaign draft.</p>
        </div>
      </section>

      <section className="bma-advertisers-section bma-advertisers-formats" aria-labelledby="adv-formats">
        <div className="bma-advertisers-shell">
          <div className="bma-advertisers-section-heading">
            <h2 id="adv-formats">Choose where your ad appears</h2>
            <Link href="/ad-formats">Compare all formats <ArrowRight aria-hidden="true" /></Link>
          </div>
          <div className="bma-advertisers-formats-grid">
            {formats.map(({ title, description, src, alt }) => (
              <Link key={title} className="bma-advertisers-format" href="/ad-formats">
                <span className="bma-advertisers-format-image">
                  <Image src={src} alt={alt} fill sizes="(max-width: 620px) 90vw, (max-width: 950px) 44vw, 30vw" />
                </span>
                <span className="bma-advertisers-format-copy">
                  <strong>{title}</strong><span>{description}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bma-advertisers-section bma-advertisers-faq" aria-labelledby="adv-faq">
        <div className="bma-advertisers-shell">
          <div className="bma-advertisers-section-heading">
            <h2 id="adv-faq">Questions advertisers ask</h2>
            <Link href="/help-center">See all questions <ArrowRight aria-hidden="true" /></Link>
          </div>
          <div className="bma-advertisers-faq-list">
            {faqs.map(({ question, answer }) => (
              <details key={question}>
                <summary><span>{question}</span><ChevronDown aria-hidden="true" /></summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bma-advertisers-closing" aria-labelledby="adv-closing">
        <div className="bma-advertisers-closing-copy">
          <h2 id="adv-closing">Start with a free draft</h2>
          <p>Create an account, upload a creative and build a draft. You decide whether to submit it.</p>
        </div>
        <Link href="/signup?role=advertiser" className="bma-advertisers-closing-button">
          Create an advertiser account <ArrowUpRight aria-hidden="true" />
        </Link>
      </section>
    </div>
  );
}
