import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CarFront,
  Eye,
  Layers3,
  LockKeyhole,
  MapPin,
  Scale,
  ShieldCheck,
  Store,
  UserRound,
} from "lucide-react";
import { publicMetadata } from "@/config/public-metadata";
import "./about.css";

export const metadata = publicMetadata(
  "/about",
  "About BlinkMyAd | Vision & Mission",
  "Learn about BlinkMyAd's vision for connecting brands and driver partners through mobile outdoor advertising.",
);

const highlights = [
  { title: "Local-first", second: "campaigns", icon: MapPin },
  { title: "Driver-powered", second: "reach", icon: CarFront },
  { title: "Human-reviewed", second: "quality", icon: ShieldCheck },
];

const photoCards = [
  {
    src: "/images/blinkmyad/bike.webp",
    screenClass: "bma-about-screen-bike",
    alt: "Scooter fitted with a rear advertising screen",
  },
  {
    src: "/images/blinkmyad/auto.webp",
    screenClass: "bma-about-screen-auto",
    alt: "Auto-rickshaw with rear digital advertising display",
  },
  {
    src: "/images/blinkmyad/car-rear.webp",
    screenClass: "bma-about-screen-car",
    alt: "Car fitted with rear-window digital advertising display",
  },
];

const audiences = [
  {
    title: "Advertisers",
    text: "Businesses that want local, flexible outdoor campaigns.",
    icon: Store,
  },
  {
    title: "Driver partners",
    text: "Bike, auto and car drivers who want to earn from their routes.",
    icon: UserRound,
  },
  {
    title: "BlinkMyAd admins",
    text: "The team that reviews creatives, campaigns and partners.",
    icon: Layers3,
  },
];

const principles = [
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
    icon: LockKeyhole,
  },
  {
    title: "Clear about what's ready",
    text: "Where something is a sample or not available yet, the page says so.",
    icon: Eye,
  },
];

export default function AboutPage() {
  return (
    <div className="bma-about">
      <section className="bma-about-hero" aria-labelledby="about-title">
        <div className="bma-about-container bma-about-hero-inner">
          <div className="bma-about-hero-copy">
            <p className="bma-about-eyebrow">About BlinkMyAd</p>
            <h1 id="about-title">
              <span>Built for brands.</span>
              <span>Made for the move.</span>
            </h1>
            <p className="bma-about-hero-description">
              BlinkMyAd puts advertising on screens carried by everyday vehicles, so local
              businesses can reach people on the move and drivers can earn from the routes
              they already drive.
            </p>
            <ul className="bma-about-highlights" aria-label="How BlinkMyAd is different">
              {highlights.map(({ title, second, icon: Icon }) => (
                <li key={title}>
                  <span className="bma-about-icon-tile"><Icon aria-hidden="true" /></span>
                  <span>{title}<br />{second}</span>
                </li>
              ))}
            </ul>
            <div className="bma-about-hero-process" aria-label="How a campaign takes shape">
              <div className="bma-about-hero-process-head">
                <p>From idea to screen</p>
                <Link href="/#how-it-works">
                  Explore the process <ArrowRight aria-hidden="true" />
                </Link>
              </div>
              <ol>
                <li><span aria-hidden="true">01</span> Plan your campaign</li>
                <li><span aria-hidden="true">02</span> Upload your creative</li>
                <li><span aria-hidden="true">03</span> Human review</li>
              </ol>
            </div>
          </div>

          <div className="bma-about-visual">
            <div className="bma-about-main-photo">
              <Image
                src="/images/blinkmyad/interior.webp"
                alt="Car interior featuring a digital advertising screen behind the front seat"
                fill
                priority
                sizes="(min-width: 1100px) 45vw, (min-width: 850px) 42vw, 94vw"
              />
              <Image
                src="/brand/blinkmyad-logo.png"
                alt=""
                aria-hidden="true"
                width={200}
                height={36}
                className="bma-about-screen-logo bma-about-screen-main"
              />
            </div>
            <ul className="bma-about-photo-row">
              {photoCards.map((photo) => (
                <li key={photo.src}>
                  <Image src={photo.src} alt={photo.alt} fill sizes="(min-width: 850px) 13vw, 30vw" />
                  <Image
                    src="/brand/blinkmyad-logo.png"
                    alt=""
                    aria-hidden="true"
                    width={200}
                    height={36}
                    className={`bma-about-screen-logo ${photo.screenClass}`}
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="bma-about-story" aria-labelledby="why-heading">
        <div className="bma-about-container bma-about-story-grid">
          <div className="bma-about-story-copy">
            <h2 id="why-heading">Why we&apos;re building it</h2>
            <p>
              Outdoor advertising has mostly meant fixed billboards: expensive,
              booked for long periods and out of reach for small businesses.
            </p>
            <p>
              Screens on vehicles change that. A neighbourhood shop can run a short
              campaign on the routes its customers use, and a driver can add an
              income without changing how they work.
            </p>
          </div>
          <div className="bma-about-audience">
            <h2 id="audience-heading">Who it&apos;s for</h2>
            <div className="bma-about-audience-list">
              {audiences.map(({ title, text, icon: Icon }) => (
                <article className="bma-about-audience-card" key={title}>
                  <span className="bma-about-icon-tile"><Icon aria-hidden="true" /></span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bma-about-principles" aria-labelledby="principles-heading">
        <div className="bma-about-container">
          <h2 id="principles-heading">How we work</h2>
          <div className="bma-about-principle-grid">
            {principles.map(({ title, text, icon: Icon }) => (
              <article className="bma-about-principle-card" key={title}>
                <span className="bma-about-icon-tile"><Icon aria-hidden="true" /></span>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bma-about-cta" aria-labelledby="about-cta-heading">
        <div className="bma-about-container bma-about-cta-inner">
          <div>
            <h2 id="about-cta-heading">Talk to us</h2>
            <p>Questions about advertising, partnering or working with BlinkMyAd?</p>
          </div>
          <Link className="bma-about-contact" href="/contact">
            Contact BlinkMyAd <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}
