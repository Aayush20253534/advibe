"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CarFront, ChevronDown, MapPin, Megaphone, Plus, UserRound } from "lucide-react";

export function BrandGlyph({ className = "" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 100 100" fill="currentColor" aria-hidden="true"><path d="M23 3H68C88 3 99 13 95 28C92 40 76 47 47 49L9 39L23 3Z M47 51C73 50 90 57 88 72C85 90 65 98 41 98H2L11 63L47 51Z" /></svg>;
}

/** An interactive illustration, with conversion links into the actual signup flow. */
export function CampaignPreview() {
  const [format, setFormat] = useState("Auto advertising");
  const [creative, setCreative] = useState(0);
  return <figure className="bma-ref-dashboard" aria-label="Illustrative campaign planner">
    <figcaption className="sr-only">Preview a campaign format and sample creative. Create an advertiser account to save and submit a real campaign.</figcaption>
    <aside className="bma-ref-dashboard-sidebar" aria-label="Campaign preview shortcuts"><Image className="bma-ref-dashboard-logo" src="/brand/blinkmyad-logo.png" alt="BlinkMyAd" width={120} height={22} /><Link href="/login" className="bma-ref-dashboard-active"><Megaphone aria-hidden="true" />Campaigns</Link><Link href="/signup?role=advertiser"><Plus aria-hidden="true" />Create campaign</Link><Link href="/login"><UserRound aria-hidden="true" />Account</Link></aside>
    <div className="bma-ref-dashboard-main">
      <p className="bma-ref-dashboard-title">Campaign overview</p>
      <div className="bma-ref-dashboard-fields"><div><span className="bma-ref-field-label" id="preview-location-label">Location</span><div className="bma-ref-preview-location" aria-labelledby="preview-location-label"><MapPin aria-hidden="true" /><span>Prayagraj</span><ChevronDown aria-hidden="true" /></div></div><label className="bma-ref-format-label"><span className="bma-ref-field-label">Ad format</span><span className="bma-ref-select"><CarFront aria-hidden="true" /><select aria-label="Preview ad format" value={format} onChange={event => setFormat(event.target.value)}><option>Auto advertising</option><option>In-car screens</option><option>Rear-window displays</option></select><ChevronDown aria-hidden="true" /></span></label></div>
      <span className="bma-ref-field-label bma-ref-creative-label">Creative</span>
      <div className="bma-ref-creative-row"><div className={`bma-ref-creative-art bma-ref-creative-${creative}`} aria-hidden="true"><span>BlinkMyAd</span><BrandGlyph /></div><div className="bma-ref-creative-description"><strong>Brand creative</strong><span>JPG / PNG</span></div><button type="button" onClick={() => setCreative(value => (value + 1) % 3)} aria-label="Change sample creative">Change</button></div>
      <p className="sr-only" role="status">{format}. Sample creative {creative + 1} of 3.</p>
      <Link href="/signup?role=advertiser" className="bma-ref-review-button">Review campaign <ArrowUpRight aria-hidden="true" /></Link>
    </div>
  </figure>;
}
