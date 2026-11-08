"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, ChevronRight } from "lucide-react";

/** Content is visible without JS; motion is opt-in after hydration and disabled by preference. */
export function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Never hide content already in view, including focused controls and anchor destinations.
    if (node.getBoundingClientRect().top < window.innerHeight) return;
    node.dataset.reveal = "waiting";
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) { node.dataset.reveal = "visible"; observer.disconnect(); }
    }, { threshold: 0.08 });
    observer.observe(node);
    return () => { observer.disconnect(); delete node.dataset.reveal; };
  }, []);
  return <div ref={ref} className={`bma-reveal ${className}`}>{children}</div>;
}

const formats = [
  { id: "auto_rear", name: "Auto rickshaw", category: "Street-level visibility", image: "auto", detail: "A rear-facing canvas along everyday routes. Built for businesses with a local story to tell.", alt: "3D concept of a rear-facing advertising screen on a white auto rickshaw" },
  { id: "bike_rear", name: "Bike & scooter", category: "Compact. Noticeable. Mobile.", image: "bike", detail: "A compact screen mounted behind the rider, bringing your message into the daily flow of the city.", alt: "3D concept of an advertising screen mounted on a scooter luggage box" },
  { id: "car_interior", name: "Inside the car", category: "Part of the passenger journey", image: "interior", detail: "A seat-back screen gives your creative a place inside the ride, with formats reviewed before scheduling.", alt: "3D concept of a passenger-facing screen on the back of a car seat" },
] as const;

export function FormatExplorer() {
  const [selected, setSelected] = useState(0);
  const active = formats[selected]!;
  return <div className="bma-format-explorer">
    <div className="bma-format-options" aria-label="Explore advertising formats">
      {formats.map((format, index) => <button type="button" key={format.id} aria-pressed={selected === index} aria-controls="format-stage" onClick={() => setSelected(index)} className="bma-format-option">
        <span className="bma-format-index">0{index + 1}</span>
        <span><strong>{format.name}</strong><span>{format.category}</span></span>
        <ArrowRight size={19} aria-hidden="true" />
      </button>)}
      <Link href="/ad-formats" className="bma-inline-link">Compare all formats <ArrowRight size={16} aria-hidden="true" /></Link>
    </div>
    <div id="format-stage" className="bma-format-stage" aria-live="polite" aria-atomic="true">
      <div className="bma-format-picture" key={active.id}>
        <Image src={`/images/blinkmyad/${active.image}.webp`} alt={active.alt} fill sizes="(min-width: 1024px) 55vw, 100vw" className={active.image === "bike" ? "object-contain" : "object-cover"} />
        <span className="bma-art-label">Illustrative concept</span>
      </div>
      <div className="bma-format-caption"><p>{active.detail}</p><Link href={`/ad-formats#${active.id}`} aria-label={`Explore ${active.name}`}><ArrowRight size={22} aria-hidden="true" /></Link></div>
    </div>
  </div>;
}

const steps = [
  { title: "Make it yours", label: "01 / Create", text: "Add your business and upload your campaign creative. Start with an image or video that makes your message clear.", status: "Creative uploaded", items: ["Business profile", "Creative file", "Screen format"] },
  { title: "Set the scene", label: "02 / Plan", text: "Choose your dates, daily hours and preferred format. Save a draft while you work through the details.", status: "Campaign draft", items: ["Prayagraj", "Campaign dates", "Daily schedule"] },
  { title: "Ready for review", label: "03 / Review", text: "Submit your draft. The team checks the creative, schedule and available screens before confirming the next step.", status: "Submitted for review", items: ["Creative check", "Availability check", "Campaign approval"] },
  { title: "Follow the campaign", label: "04 / Manage", text: "Manage approved campaigns and follow recorded activity in your advertiser workspace. Your campaign details stay together.", status: "Advertiser workspace", items: ["Campaign status", "Recorded activity", "Billing & reports"] },
] as const;

export function CampaignJourney() {
  const [selected, setSelected] = useState(0);
  const active = steps[selected]!;
  return <div className="bma-journey">
    <div className="bma-journey-steps" aria-label="Campaign journey">
      {steps.map((step, index) => <button type="button" key={step.title} aria-pressed={selected === index} aria-controls="campaign-explanation" onClick={() => setSelected(index)}>
        <span className="bma-step-number">0{index + 1}</span><span>{step.title}</span><ChevronRight size={18} aria-hidden="true" />
      </button>)}
    </div>
    <div id="campaign-explanation" className="bma-journey-detail" aria-live="polite" aria-atomic="true">
      <span className="bma-eyebrow">{active.label}</span>
      <h3>{active.title}</h3><p>{active.text}</p>
      <div className="bma-workflow-preview">
        <div><span>Campaign workspace</span><span>Illustration</span></div>
        <strong>{active.status}</strong>
        <div className="bma-journey-progress" aria-hidden="true"><span style={{ width: `${(selected + 1) * 25}%` }} /></div>
        <ul>{active.items.map(item => <li key={item}><Check size={15} aria-hidden="true" />{item}</li>)}</ul>
      </div>
    </div>
  </div>;
}
