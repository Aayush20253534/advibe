"use client";

import {useId,useState} from "react";
import {Button} from "@/components/ui";
import {controlClass} from "@/components/ui/input";
import {mapsEmbedUrl} from "@/services/maps-embed.mjs";
import {coverageForLocation,formatCoverageRadius,type CoverageZone} from "@/services/maps-coverage.mjs";
import {GoogleCoverageMap} from "./google-coverage-map";

type Area={id:string;name:string;lat:number;lng:number;zoneId?:string};

export function PublishedAreaMap({locations,zones=[]}:{locations:Area[];zones?:CoverageZone[]}){
 const id=useId();
 const [selected,setSelected]=useState("");
 const [enabled,setEnabled]=useState(false);
 const embedKey=process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY;
 const mapsEnabled=process.env.NEXT_PUBLIC_GOOGLE_MAPS_ENABLED;
 const coverageEnabled=process.env.NEXT_PUBLIC_GOOGLE_MAPS_COVERAGE_ENABLED==="true";
 const jsKey=process.env.NEXT_PUBLIC_GOOGLE_MAPS_JS_KEY;
 const valid=locations.filter(area=>mapsEmbedUrl(embedKey,area.lat,area.lng,mapsEnabled));
 const area=valid.find(item=>item.id===selected)??valid[0];
 const url=area&&mapsEmbedUrl(embedKey,area.lat,area.lng,mapsEnabled);
 if(!area||!url)return null;
 const zone=coverageForLocation(area,zones);
 const hasBoundary=Boolean(zone&&coverageEnabled&&jsKey);

 return (
  <section aria-labelledby={`${id}-title`} className="overflow-hidden rounded-xl border border-line bg-surface">
   <div className="space-y-3 p-5">
    <h2 id={`${id}-title`} className="font-heading text-xl font-bold text-ink">Explore a published area</h2>
    <label htmlFor={`${id}-area`} className="block text-sm font-semibold text-ink">Area on this page</label>
    <select id={`${id}-area`} className={controlClass} value={area.id} onChange={event=>setSelected(event.target.value)}>
     {valid.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}
    </select>
    <p className="text-sm leading-6 text-ink-muted">
     Published-area reference only. No driving route, verified screen coverage or campaign delivery is implied.
    </p>
    {hasBoundary&&zone&&<div className="flex flex-wrap items-center gap-2 rounded-lg border border-[#cbdcff] bg-[#eef5ff] px-3 py-2 text-sm text-[#16408d]">
     <span aria-hidden="true" className="inline-block size-3 shrink-0 rounded-full border-[3px] border-[#125af4] bg-[#d6e6ff]"/>
     <strong>{zone.name} planning radius: {formatCoverageRadius(zone.radiusMeters)}</strong>
     <span className="text-xs">Configured by BlinkMyAd Admin; not a confirmed vehicle route</span>
    </div>}
   </div>
   {enabled ? <>
    {hasBoundary&&zone&&jsKey?
     <GoogleCoverageMap location={area} zone={zone} apiKey={jsKey} fallbackUrl={url}/>:
     <iframe title={`Google Maps area view: ${area.name}`} src={url} loading="lazy" width="600" height="320"
      className="h-80 w-full border-0" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen/>}
    <div className="p-4">
     <Button variant="secondary" size="sm" onClick={()=>setEnabled(false)}>Close map</Button>
    </div>
   </>:<div className="flex min-h-52 flex-col items-start justify-center gap-3 bg-paper p-5">
    <p className="text-sm text-ink-muted">Loading the map connects to Google Maps. The location list is available without it.</p>
    <Button variant="secondary" onClick={()=>setEnabled(true)}>Load Google Maps</Button>
   </div>}
  </section>
 );
}
