import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Eye,
  FileImage,
  Layers3,
  MapPin,
  Play,
  ShieldCheck,
  Target,
} from "lucide-react";
import { publicMetadata } from "@/config/public-metadata";
import { FormatCatalogue } from "@/components/public/format-catalogue";
import { FAQList } from "@/components/public/faq-list";
import { publicFAQs } from "@/components/public/faq-data";
import "@/components/public/ad-formats.css";

export const metadata = publicMetadata(
  "/ad-formats",
  "Ad Formats | Digital Vehicle Advertising",
  "Compare bike, auto-rickshaw and car advertising placements, screen formats, creative concepts and example specifications.",
);
const guidance = [
  {
    title: "Who will see it",
    text: "Rear screens reach following traffic and pedestrians; seat-back screens reach passengers for the whole ride.",
    icon: Eye,
  },
  {
    title: "Where it travels",
    text: "Autos and bikes stay on local routes; cars cover more of the city.",
    icon: Target,
  },
  {
    title: "The file you need",
    text: "Prepare your image or video in the format's aspect ratio. An admin checks it before it can run.",
    icon: FileImage,
  },
  {
    title: "What is allowed",
    text: "Ads must follow BlinkMyAd's content rules and the law. Misleading or prohibited content is rejected.",
    icon: ShieldCheck,
  },
];

export default function Page() {
  return (
    <div className="bma-formats-page">
      <section className="bma-formats-hero" aria-labelledby="formats-title">
        <Image
          src="/images/blinkmyad/ad-formats/hero.webp"
          alt="Illustrative vehicle advertising placements: a scooter, auto rickshaws, a car, a seat-back screen and a printed helmet wrap"
          fill
          preload
          sizes="100vw"
          className="bma-formats-hero-image"
        />
        <div className="bma-formats-container bma-formats-hero-inner">
          <div className="bma-formats-hero-copy">
            <p className="bma-formats-eyebrow">Vehicle-screen advertising</p>
            <h1 id="formats-title">
              Ad formats built for <span>real-world city visibility</span>
            </h1>
            <p className="bma-formats-hero-description">
              Compare vehicle-based placements, audience reach, and what each format is best suited
              for — from bikes and auto rickshaws to cars and helmets.
            </p>
            <div className="bma-formats-hero-actions">
              <a href="#format-explorer" className="bma-formats-button">
                Explore ad formats <ArrowRight aria-hidden="true" />
              </a>
              <Link href="/#how-it-works" className="bma-formats-button bma-formats-button-outline">
                <Play aria-hidden="true" /> How it works
              </Link>
            </div>
            <ul className="bma-formats-highlights" aria-label="Vehicle advertising benefits">
              {[
                { icon: Eye, title: "High city visibility", text: "On busy, real routes" },
                { icon: MapPin, title: "Real-world reach", text: "Across key local areas" },
                { icon: Layers3, title: "Multiple formats", text: "For every campaign goal" },
              ].map(({ icon: Icon, title, text }) => (
                <li key={title}>
                  <Icon aria-hidden="true" />
                  <div>
                    <strong>{title}</strong>
                    <span>{text}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      <div className="bma-formats-container">
        <section
          id="format-explorer"
          className="bma-formats-explorer"
          aria-labelledby="explorer-title"
        >
          <p className="bma-formats-eyebrow">Format explorer</p>
          <h2 id="explorer-title">Explore our ad formats</h2>
          <p className="bma-formats-section-description">
            Choose a vehicle placement, see how it works, and find the right fit for your campaign
            goals.
          </p>
          <FormatCatalogue />
        </section>
        <section className="bma-formats-guidance" aria-labelledby="choosing">
          <p className="bma-formats-eyebrow">Guidance</p>
          <h2 id="choosing">How to choose a format</h2>
          <div className="bma-formats-guide-grid">
            {guidance.map(({ title, text, icon: Icon }) => (
              <article key={title} className="bma-formats-guide-item">
                <Icon aria-hidden="true" />
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section className="bma-formats-faq" aria-labelledby="format-faq">
          <p className="bma-formats-eyebrow">FAQ</p>
          <div className="bma-formats-faq-heading">
            <h2 id="format-faq">Questions about formats</h2>
            <Link href="/help-center">
              See all questions <ArrowRight aria-hidden="true" />
            </Link>
          </div>
          <FAQList
            items={publicFAQs.filter(
              (faq) => faq.category === "Technical" || faq.question.includes("types of vehicle"),
            )}
          />
        </section>
      </div>
      <section className="bma-formats-closing" aria-labelledby="formats-closing-title">
        <div>
          <h2 id="formats-closing-title">Picked a format?</h2>
          <p>Create an account to upload your creative and build a campaign draft.</p>
        </div>
        <Link
          href="/signup?role=advertiser"
          className="bma-formats-button bma-formats-button-white"
        >
          Create an advertiser account <ArrowRight aria-hidden="true" />
        </Link>
      </section>
    </div>
  );
}
