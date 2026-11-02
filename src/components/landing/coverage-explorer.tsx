"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, MapPin, Navigation2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Planning landmarks, not live inventory or precise screen locations.
const areas = [
  { name: "Civil Lines", detail: "Commercial streets, shops and everyday local journeys", x: "37%", y: "35%" },
  { name: "Katra", detail: "Student activity, markets and neighbourhood businesses", x: "70%", y: "24%" },
  { name: "Naini", detail: "Residential connections and routes across the river", x: "57%", y: "72%" },
] as const;

export function CoverageExplorer() {
  const [selected, setSelected] = React.useState<(typeof areas)[number]["name"]>("Civil Lines");
  const active = areas.find((area) => area.name === selected) ?? areas[0];
  return (
    <section id="coverage" className="scroll-mt-24 bg-surface py-16 sm:py-20" aria-labelledby="coverage-heading">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div>
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-signal"><MapPin className="size-4" aria-hidden="true" /> OUR FIRST CITY</span>
          <h2 id="coverage-heading" className="mt-4 font-heading text-3xl font-bold tracking-tight text-ink sm:text-4xl">Local focus. Real-world routes.</h2>
          <p className="mt-4 max-w-xl text-lg leading-7 text-ink-muted">
            AdVibe is focusing on Prayagraj for its first launch. Explore familiar parts of the city while our team prepares approved screen inventory.
          </p>
          <div className="mt-7 grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
            {areas.map((area) => (
              <button key={area.name} type="button" aria-pressed={selected === area.name} onClick={() => setSelected(area.name)}
                className={cn("flex min-h-12 items-center justify-between rounded-lg border px-4 py-3 text-left text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal",
                  selected === area.name ? "border-signal bg-signal-soft text-ink" : "border-line bg-white text-ink hover:border-line-strong")}>
                {area.name}<Navigation2 className="size-4 text-signal" aria-hidden="true" />
              </button>
            ))}
          </div>
          <p className="mt-4 text-sm text-ink-muted">Planning areas are illustrative, not confirmed coverage or available screens.</p>
          <Link href="/locations" className="mt-6 inline-flex min-h-11 items-center gap-2 font-semibold text-signal hover:underline">
            Check published locations <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="overflow-hidden rounded-2xl border border-line bg-paper p-5 sm:p-7">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-ink">Prayagraj area explorer</span>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-ink-muted">Schematic only</span>
          </div>
          <div className="relative mt-5 h-[290px] overflow-hidden rounded-xl border border-line bg-[#eaf1fb] sm:h-[340px]" aria-label={"Illustrative city-area diagram with " + active.name + " selected"}>
            <svg viewBox="0 0 600 350" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full" aria-hidden="true">
              <path d="M-40 240 Q120 180 250 240 T640 190" fill="none" stroke="#ffffff" strokeWidth="52" />
              <path d="M-40 240 Q120 180 250 240 T640 190" fill="none" stroke="#a9c9ea" strokeWidth="22" />
              <path d="M20 20 L530 320 M40 320 L570 50 M0 110 L600 90 M170 0 L220 350" fill="none" stroke="#ffffff" strokeWidth="10" strokeLinecap="round" />
              <path d="M220 70 Q360 90 390 235" fill="none" stroke="#0866ff" strokeWidth="4" strokeDasharray="8 9" strokeLinecap="round" />
            </svg>
            {areas.map((area) => (
              <button key={area.name} type="button" onClick={() => setSelected(area.name)} aria-label={"Explore " + area.name} aria-pressed={selected === area.name}
                style={{ left: area.x, top: area.y }}
                className={cn("absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white px-3 py-2 text-xs font-bold shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal",
                  selected === area.name ? "bg-ink text-white" : "bg-surface text-ink")}>
                {area.name}
              </button>
            ))}
          </div>
          <div aria-live="polite" className="mt-5 flex items-start gap-3 rounded-lg bg-white p-4">
            <MapPin className="mt-1 size-5 shrink-0 text-signal" aria-hidden="true" />
            <div>
              <h3 className="font-heading font-bold text-ink">{active.name}</h3>
              <p className="mt-1 text-sm leading-6 text-ink-muted">{active.detail}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
