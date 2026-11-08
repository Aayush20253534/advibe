import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { publicMetadata } from "@/config/public-metadata";
import { CampaignPreview, BrandGlyph } from "@/components/landing/campaign-preview";

export const metadata = publicMetadata("/", "Outdoor advertising. In motion.", "Put your brand on the journeys that matter. Explore BlinkMyAd vehicle advertising and create your next campaign, starting in Prayagraj.");

const formats = [
  { name: "Auto advertising", image: "02-auto-advertising", description: "High-visibility branding on electric rickshaws.", alt: "White electric rickshaw with a blue BlinkMyAd advertising display", href: "/ad-formats#auto_rear" },
  { name: "In-car screens", image: "03-in-car-screen", description: "Bring your message inside the ride.", alt: "BlinkMyAd advertising screen mounted behind a black leather car headrest", href: "/ad-formats#car_interior" },
  { name: "Rear-window displays", image: "04-rear-window-display", description: "A bold, unmissable canvas on the move.", alt: "White sedan with a cobalt BlinkMyAd rear-window display", href: "/ad-formats#car_rear" },
] as const;

export default function HomePage() {
  return <div className="bma-reference-home">
    <section className="bma-ref-hero" aria-labelledby="hero-title">
      <Image className="bma-ref-hero-art" src="/images/blinkmyad/homepage/01-hero-fleet.webp" alt="Illustrative concept of BlinkMyAd advertising on a white electric rickshaw and sedan" fill priority fetchPriority="high" sizes="100vw" unoptimized />
      <video
        className="bma-ref-hero-video"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/images/blinkmyad/homepage/01-hero-fleet.webp"
        aria-hidden="true"
        tabIndex={-1}
      >
        <source src="/images/blinkmyad/homepage/01-hero-fleet.mp4" type="video/mp4" />
      </video>
      <div className="bma-ref-wrap bma-ref-hero-inner"><div className="bma-ref-hero-copy">
        <p className="bma-ref-eyebrow bma-ref-hero-eyebrow"><span aria-hidden="true" />Outdoor advertising. In motion.</p>
        <h1 id="hero-title"><span>Turn heads.</span><span>Own the</span><span>streets.</span></h1>
        <p className="bma-ref-intro">Put your brand on the journeys that matter.<br className="bma-ref-desktop-break" /> Vehicle advertising, built around your campaign.</p>
        <div className="bma-ref-hero-actions"><Link className="bma-ref-button" href="/signup?role=advertiser">Create a campaign <ArrowUpRight aria-hidden="true" /></Link><a className="bma-ref-text-link" href="#formats">Explore ad formats <ArrowDown aria-hidden="true" /></a></div>
      </div></div>
      <p className="bma-ref-hero-caption">Built for real-world attention.</p>
    </section>

    <div className="bma-ref-wrap bma-ref-proof" aria-label="The BlinkMyAd approach"><strong>Prayagraj pilot</strong><span>Street-level visibility</span><span>Flexible formats</span><span>Campaign control</span></div>

    <section id="formats" className="bma-ref-formats bma-ref-wrap" aria-labelledby="formats-title">
      <div className="bma-ref-section-heading"><div><p className="bma-ref-eyebrow">01 / The formats</p><h2 id="formats-title">Different journeys.<br />One powerful presence.</h2></div><p>Find the right canvas for your brand.</p></div>
      <div className="bma-ref-format-grid">{formats.map((format, index) => <article className="bma-ref-format" key={format.image}>
        <Link href={format.href} className="bma-ref-format-photo" aria-label={`Explore ${format.name}`}><Image src={`/images/blinkmyad/homepage/${format.image}.webp`} alt={format.alt} fill sizes="(min-width: 1600px) 480px, (min-width: 701px) 31vw, 100vw" /></Link>
        <div className="bma-ref-format-info"><div><h3><span>0{index + 1}</span>{format.name}</h3><p>{format.description}</p></div><Link href={format.href} className="bma-ref-round-link" aria-label={`View ${format.name}`}><ArrowUpRight aria-hidden="true" /></Link></div>
      </article>)}</div>
      <Link className="bma-ref-text-link bma-ref-all-formats" href="/ad-formats">Explore all ad formats <ArrowUpRight aria-hidden="true" /></Link>
    </section>

    <section id="how-it-works" className="bma-ref-process" aria-labelledby="journey-title"><div className="bma-ref-wrap">
      <div className="bma-ref-process-top"><div className="bma-ref-process-copy"><p className="bma-ref-eyebrow">02 / From plan to placement</p><h2 id="journey-title">Your next campaign.<br />A clear way forward.</h2><svg className="bma-ref-route" viewBox="0 0 600 66" fill="none" aria-hidden="true"><path className="bma-ref-route-base" d="M10 50H330C350 50 350 26 373 26H600" /><path className="bma-ref-route-draw" d="M10 50H330C350 50 350 26 373 26H600" pathLength="1" /><circle cx="10" cy="50" r="7" /></svg></div><CampaignPreview /></div>
      <ol className="bma-ref-steps" aria-label="How your campaign works"><li><span>01</span><div><h3>Plan your campaign</h3><p>Choose your city, format and dates.</p></div></li><li><span>02</span><div><h3>Add your creative</h3><p>Give your message a moving canvas.</p></div></li><li><span>03</span><div><h3>Review and launch</h3><p>Confirm your campaign details.</p></div></li></ol>
    </div></section>

    <section className="bma-ref-city" aria-labelledby="city-title"><div className="bma-ref-wrap bma-ref-city-inner"><div className="bma-ref-city-copy"><p className="bma-ref-eyebrow">03 / Our first city</p><h2 id="city-title">Big ambition.<br />Starting in Prayagraj.</h2><p>A focused city pilot. Built around the places people move, meet and discover.</p><Link href="/locations" className="bma-ref-button bma-ref-button-outline">Explore Prayagraj <ArrowUpRight aria-hidden="true" /></Link></div><figure className="bma-ref-city-figure"><Image src="/images/blinkmyad/homepage/05-prayagraj-city.webp" alt="Illustrative white Prayagraj riverfront diorama with electric rickshaws following a blue route beside the ghats and bridge" width={1942} height={809} sizes="(min-width: 701px) 69vw, 100vw" /><video className="bma-ref-city-video" autoPlay muted loop playsInline preload="metadata" poster="/images/blinkmyad/homepage/05-prayagraj-city.webp" aria-hidden="true" tabIndex={-1}><source src="/images/blinkmyad/homepage/05-prayagraj-city.mp4" type="video/mp4" /></video></figure></div></section>

    <section className="bma-ref-closing" aria-labelledby="closing-title"><div className="bma-ref-wrap bma-ref-closing-inner"><h2 id="closing-title">Let’s get<br />your brand moving.</h2><div className="bma-ref-closing-action"><p>Your next move starts here.</p><Link href="/signup?role=advertiser" className="bma-ref-button bma-ref-button-white">Create a campaign <ArrowUpRight aria-hidden="true" /></Link></div><BrandGlyph className="bma-ref-closing-glyph" /></div></section>
  </div>;
}
