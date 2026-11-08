"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui";
import { controlClass } from "@/components/ui/input";
import { mapsEmbedUrl } from "@/services/maps-embed.mjs";

type Area = { id: string; name: string; lat: number; lng: number };

export function PublishedAreaMap({ locations }: { locations: Area[] }) {
  const id = useId();
  const [selected, setSelected] = useState("");
  const [enabled, setEnabled] = useState(false);
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY;
  const mapsEnabled = process.env.NEXT_PUBLIC_GOOGLE_MAPS_ENABLED;
  const valid = locations.filter((area) => mapsEmbedUrl(key, area.lat, area.lng, mapsEnabled));
  const area = valid.find((item) => item.id === selected) ?? valid[0];
  const url = area && mapsEmbedUrl(key, area.lat, area.lng, mapsEnabled);
  if (!area || !url) return null;

  return (
    <section aria-labelledby={`${id}-title`} className="overflow-hidden rounded-xl border border-line bg-surface">
      <div className="space-y-3 p-5">
        <h2 id={`${id}-title`} className="font-heading text-xl font-bold text-ink">Explore a published area</h2>
        <label htmlFor={`${id}-area`} className="block text-sm font-semibold text-ink">Area on this page</label>
        <select id={`${id}-area`} className={controlClass} value={area.id} onChange={(event) => setSelected(event.target.value)}>
          {valid.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
        <p className="text-sm leading-6 text-ink-muted">Area reference only. Screen availability and campaign delivery are confirmed separately.</p>
      </div>
      {enabled ? (
        <>
          <iframe title={`Google Maps area view: ${area.name}`} src={url} loading="lazy" width="600" height="320"
            className="h-80 w-full border-0" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />
          <div className="p-4"><Button variant="secondary" size="sm" onClick={() => setEnabled(false)}>Close map</Button></div>
        </>
      ) : (
        <div className="flex min-h-52 flex-col items-start justify-center gap-3 bg-paper p-5">
          <p className="text-sm text-ink-muted">Loading the map connects to Google Maps. You can also use the location list without loading it.</p>
          <Button variant="secondary" onClick={() => setEnabled(true)}>Load Google Maps</Button>
        </div>
      )}
    </section>
  );
}
