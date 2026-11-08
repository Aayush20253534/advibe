import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight, MapPin } from "lucide-react";
import { publicMetadata } from "@/config/public-metadata";
import { CampaignJourney, FormatExplorer, Reveal } from "@/components/landing/brand-experience";
import { FAQList } from "@/components/public/faq-list";
import { publicFAQs } from "@/components/public/faq-data";
import { primaryButton, outlineButton } from "@/components/public/marketing-blocks";

export const metadata = publicMetadata("/", "Advertising that moves with the city", "Put your brand on everyday journeys. Explore BlinkMyAd vehicle-screen advertising and plan your next campaign, starting in Prayagraj.");

export default function HomePage() {
  return <>
    <section className="bma-home-hero" aria-labelledby="hero-title">
      <div className="bma-container bma-hero-grid">
        <div className="bma-hero-copy">
          <span className="bma-eyebrow"><span className="bma-small-square" /> Outdoor advertising. In motion.</span>
          <h1 id="hero-title">Great brands.<br />Seen on<br /><span>the move.</span></h1>
          <p>Turn everyday journeys into a place for your brand. Vehicle-screen advertising, starting in Prayagraj.</p>
          <div className="bma-hero-actions"><Link href="/signup?role=advertiser" className={primaryButton}>Create a campaign <ArrowUpRight size={17} aria-hidden="true" /></Link><Link href="/ad-formats" className="bma-inline-link">Explore the formats <ArrowRight size={16} aria-hidden="true" /></Link></div>
          <div className="bma-hero-footnote"><MapPin size={14} aria-hidden="true" /> Prayagraj pilot <span aria-hidden="true">/</span> Free to start a draft</div>
        </div>
        <div className="bma-hero-visual">
          <div className="bma-hero-image"><Image src="/images/blinkmyad/fleet.webp" alt="Custom 3D concept of BlinkMyAd advertising screens on an auto rickshaw and scooter" fill priority fetchPriority="high" sizes="(min-width: 1024px) 58vw, 100vw" className="object-cover" /></div>
          <div className="bma-hero-caption"><span>More than a fixed point.<br /><strong>A moving canvas.</strong></span><span>Vehicle & screen concepts<br />Illustrative artwork</span></div>
        </div>
      </div>
      <div className="bma-container bma-hero-bottom"><span>Your city. Your audience. Your next move.</span><a href="#formats"><ArrowDown size={17} aria-hidden="true" /> Discover BlinkMyAd</a></div>
    </section>

    <section className="bma-proof-strip" aria-label="The BlinkMyAd approach"><div className="bma-container">
      {[["01", "Built for everyday routes", "Reach people as the city moves."], ["02", "Planned around your business", "Choose formats, dates and daily hours."], ["03", "Reviewed before launch", "Creative and availability checked first."]].map(([number, title, text]) => <div key={number}><span>{number}</span><div><h2>{title}</h2><p>{text}</p></div></div>)}
    </div></section>

    <section id="formats" className="bma-section" aria-labelledby="formats-title"><div className="bma-container">
      <Reveal><div className="bma-section-heading"><div><span className="bma-eyebrow">The formats</span><h2 id="formats-title">Different journeys.<br />One clear message.</h2></div><p>From the street to the passenger seat, find a canvas that fits your campaign.</p></div></Reveal>
      <Reveal><FormatExplorer /></Reveal>
    </div></section>

    <section className="bma-section bma-dark" aria-labelledby="journey-title"><div className="bma-container">
      <Reveal><div className="bma-section-heading"><div><span className="bma-eyebrow">From idea to the street</span><h2 id="journey-title">A campaign.<br />A clear path to launch.</h2></div><p>Your creative, schedule and campaign updates in one advertiser workspace.</p></div></Reveal>
      <Reveal><CampaignJourney /></Reveal>
      <div className="bma-dark-footer"><p>Build a draft at your own pace. Nothing is booked or charged when you save it.</p><Link href="/for-advertisers" className="bma-inline-link">For advertisers <ArrowRight size={17} aria-hidden="true" /></Link></div>
    </div></section>

    <section className="bma-section" aria-labelledby="city-title"><div className="bma-container bma-city-grid">
      <Reveal><span className="bma-eyebrow">Our first chapter</span><h2 id="city-title" className="bma-display">One city.<br />So much to say.</h2><p className="bma-body">We’re starting in Prayagraj. A city of neighbourhood businesses, busy commutes and stories waiting to be seen.</p><p className="bma-body">Explore published locations and plan around the people you want to reach. Screen availability is confirmed for each campaign.</p><Link href="/locations" className={outlineButton}>Explore Prayagraj <ArrowUpRight size={17} aria-hidden="true" /></Link></Reveal>
      <Reveal><div className="bma-city-art" aria-label="Abstract route illustration for the Prayagraj pilot; not a live coverage map"><span className="bma-city-index">01 / FIRST CITY</span><div className="bma-city-route" aria-hidden="true"><i /><i /><i /></div><div className="bma-city-name"><MapPin size={28} aria-hidden="true" /><strong>Prayagraj</strong><span>Uttar Pradesh, India</span></div><span className="bma-city-note">Route illustration · Pilot launch</span></div></Reveal>
    </div></section>

    <section className="bma-partner-section" aria-labelledby="partner-title"><div className="bma-container bma-partner-grid">
      <div className="bma-partner-art"><Image src="/images/blinkmyad/auto.webp" alt="Illustrative concept of an advertising screen mounted on an auto rickshaw" fill sizes="(min-width: 900px) 50vw, 100vw" className="object-cover" /><span className="bma-art-label">Illustrative concept</span></div>
      <Reveal className="bma-partner-copy"><span className="bma-eyebrow">For driver partners</span><h2 id="partner-title" className="bma-display">Your regular routes.<br />A new opportunity.</h2><p className="bma-body">Apply to carry approved advertising on your vehicle. Follow your application, assignments and recorded earnings in your partner workspace.</p><Link href="/signup?role=driver" className={primaryButton}>Become a partner <ArrowUpRight size={17} aria-hidden="true" /></Link><p className="bma-small-note">Subject to verification, installation approval and the partner agreement.</p></Reveal>
    </div></section>

    <section className="bma-section" aria-labelledby="questions-title"><div className="bma-container bma-faq-grid"><div><span className="bma-eyebrow">Good to know</span><h2 id="questions-title" className="bma-display">Before your<br />first move.</h2><Link href="/help-center" className="bma-inline-link">Visit the help centre <ArrowRight size={16} aria-hidden="true" /></Link></div><FAQList items={publicFAQs.filter(f => f.category === "Advertisers").slice(0, 4)} /></div></section>

    <section className="bma-closing" aria-labelledby="closing-title"><div className="bma-container"><div><span className="bma-eyebrow">Make your next move visible.</span><h2 id="closing-title">The city is moving.<br />Bring your brand along.</h2></div><Link href="/signup?role=advertiser" className="bma-white-button">Create a campaign <ArrowUpRight size={20} aria-hidden="true" /></Link></div></section>
  </>;
}
