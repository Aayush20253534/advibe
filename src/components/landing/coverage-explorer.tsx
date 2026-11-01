"use client";

import * as React from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { Tabs } from "@/components/ui";
import { cn } from "@/lib/utils";

// Example cities for explaining area-based planning. Not a statement of where AdVibe operates.
const cities = [
  { name: "Delhi", x: 49, y: 21 },
  { name: "Mumbai", x: 31, y: 62 },
  { name: "Bengaluru", x: 45, y: 82 },
  { name: "Hyderabad", x: 50, y: 64 },
  { name: "Pune", x: 38, y: 65 },
  { name: "Chennai", x: 59, y: 82 },
  { name: "Kolkata", x: 78, y: 48 },
] as const;

export function CoverageExplorer() {
  const [chosen, setChosen] = React.useState<string>(cities[0].name);
  return (
    <section
      aria-labelledby="coverage-heading"
      id="coverage"
      className="scroll-mt-24 bg-surface py-14 sm:py-20"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1fr] lg:gap-16">
        <div>
          <h2
            id="coverage-heading"
            className="font-heading text-2xl font-bold text-ink sm:text-3xl"
          >
            Plan by city and area
          </h2>
          <p className="mt-3 max-w-xl text-base text-ink-muted">
            Campaigns are planned by city and zone, so your ad runs where your customers are. Pick
            an example city to see how planning starts.
          </p>
          <Tabs
            label="Example cities"
            tabs={cities.map((c) => ({ value: c.name, label: c.name }))}
            value={chosen}
            onValueChange={setChosen}
            className="mt-6 flex-wrap"
          />
          <p className="mt-6 text-sm text-ink-muted">
            Example cities only. Screen availability is confirmed for each campaign.
          </p>
          <Link
            href={"/locations?city=" + encodeURIComponent(chosen)}
            className="mt-6 inline-flex min-h-12 items-center rounded-lg border border-line-strong px-6 text-base font-semibold text-ink hover:bg-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
          >
            Explore sample areas in {chosen}
          </Link>
        </div>
        <div className="rounded-lg border border-line bg-paper p-4 sm:p-6">
          <div
            className="relative mx-auto aspect-[1.35/1] w-full max-w-[520px]"
            role="group"
            aria-label={"Schematic map of India with " + chosen + " selected"}
          >
            <svg
              viewBox="0 0 540 400"
              preserveAspectRatio="xMidYMid meet"
              className="absolute inset-0 size-full"
              aria-hidden="true"
            >
              <path
                d="M192 38 228 26 251 52 289 38 314 72 355 66 372 92 419 81 445 120 479 128 492 143 462 172 442 158 418 187 391 195 378 235 344 246 318 291 295 301 280 338 267 370 248 341 239 302 212 280 206 253 183 232 190 206 158 184 145 156 169 135 157 104 181 83Z"
                fill="#e8f0fe"
                stroke="#9fb0cc"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              {/* Route lines between cities. fill="none" matters: the default fill is black. */}
              <path
                d="M207 75 249 93 258 163 281 205 272 309m57-210-29 66 57 61m-201-52 113 22m40 57 49-4 39-71"
                fill="none"
                stroke="#0866ff"
                strokeOpacity="0.35"
                strokeWidth="2"
                strokeDasharray="4 6"
              />
            </svg>
            {cities.map((city) => {
              const isChosen = city.name === chosen;
              return (
                <button
                  key={city.name}
                  type="button"
                  aria-label={"Choose " + city.name}
                  aria-pressed={isChosen}
                  onClick={() => setChosen(city.name)}
                  className={cn(
                    "absolute grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal",
                  )}
                  style={{ left: city.x + "%", top: city.y + "%" }}
                >
                  <span
                    className={cn(
                      "grid place-items-center rounded-full border-2 border-white shadow-raised transition-transform",
                      isChosen ? "size-9 bg-ink text-white" : "size-7 bg-signal text-white",
                    )}
                  >
                    <MapPin className="size-4" aria-hidden />
                  </span>
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-center text-xs text-ink-muted">Schematic map. Not to scale.</p>
        </div>
      </div>
    </section>
  );
}
