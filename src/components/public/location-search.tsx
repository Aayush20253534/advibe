"use client";

import * as React from "react";
import Link from "next/link";
import { List, MapPin, MapPinned, Search } from "lucide-react";
import { createDemoSeed } from "@/data/demo-seed";
import { Field, Input, Select, StatusBadge } from "@/components/ui";
import { cn } from "@/lib/utils";
import { InfoNote, outlineButton } from "./marketing-blocks";

// Fictional sample records for illustrating the planner. Not live inventory.
const seed = createDemoSeed();
const cities = [
  "Prayagraj",
  "Lucknow",
  "Delhi",
  "Mumbai",
  "Bengaluru",
  "Hyderabad",
  "Pune",
  "Chennai",
  "Kolkata",
];
const coordinates: Record<string, { x: number; y: number }> = {
  "Civil Lines": { x: 47, y: 40 },
  Katra: { x: 69, y: 34 },
  Naini: { x: 55, y: 77 },
  Hazratganj: { x: 52, y: 53 },
};

export function LocationSearch() {
  const [city, setCity] = React.useState("Prayagraj");
  const [query, setQuery] = React.useState("");
  const [view, setView] = React.useState<"map" | "list">("map");
  const [selected, setSelected] = React.useState<string | null>("loc-1");
  React.useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const raw = new URLSearchParams(window.location.search).get("city");
      if (raw && cities.some((c) => c.toLowerCase() === raw.toLowerCase())) {
        const found = cities.find((c) => c.toLowerCase() === raw.toLowerCase())!;
        setCity(found);
        setSelected(null);
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);
  const records = seed.locations.filter(
    (l) =>
      l.city === city &&
      (!query ||
        [l.name, l.zone, l.city].some((v) => v.toLowerCase().includes(query.trim().toLowerCase()))),
  );
  const selection = records.find((l) => l.id === selected) ?? records[0];
  const count = (locId: string) => seed.screens.filter((s) => s.locationId === locId).length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 rounded-lg border border-line bg-surface p-4 sm:grid-cols-[minmax(180px,0.6fr)_minmax(0,1fr)]">
        <Field label="City" htmlFor="location-city">
          <Select
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              setSelected(null);
            }}
          >
            {cities.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
        </Field>
        <Field label="Area or landmark" htmlFor="location-query">
          <div className="relative">
            <Search
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-muted"
            />
            <Input
              id="location-query"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="For example Civil Lines"
              className="pl-9"
            />
          </div>
        </Field>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <div className="overflow-hidden rounded-lg border border-line bg-surface">
          <div className="flex items-center justify-between gap-2 border-b border-line p-3">
            <h3 className="font-heading text-base font-semibold text-ink">
              Sample areas in {city}
            </h3>
            <div
              className="flex gap-1 rounded-md border border-line p-0.5"
              role="group"
              aria-label="View"
            >
              {(
                [
                  ["map", "Map view", MapPinned],
                  ["list", "List view", List],
                ] as const
              ).map(([value, label, Icon]) => (
                <button
                  key={value}
                  type="button"
                  aria-label={label}
                  aria-pressed={view === value}
                  onClick={() => setView(value)}
                  className={cn(
                    "grid size-10 place-items-center rounded focus-visible:outline-2 focus-visible:outline-signal",
                    view === value ? "bg-signal text-white" : "text-ink-muted hover:bg-paper",
                  )}
                >
                  <Icon className="size-5" aria-hidden />
                </button>
              ))}
            </div>
          </div>
          {view === "map" ? (
            <div
              className="relative h-[340px] overflow-hidden bg-surface-sunken sm:h-[400px]"
              role="group"
              aria-label={"Schematic map of sample areas in " + city}
            >
              <svg
                className="absolute inset-0 size-full"
                viewBox="0 0 600 400"
                preserveAspectRatio="xMidYMid slice"
                aria-hidden="true"
              >
                <path
                  d="M-40 300 Q160 160 320 330 T660 220"
                  fill="none"
                  stroke="#c9d8ee"
                  strokeWidth="40"
                />
                {Array.from({ length: 7 }, (_, i) => (
                  <path
                    key={"h" + i}
                    d={"M0 " + (i * 64 + 20) + " L600 " + (i * 64 + 40)}
                    stroke="#fff"
                    strokeWidth={i % 3 === 0 ? 8 : 4}
                    fill="none"
                  />
                ))}
                {Array.from({ length: 9 }, (_, i) => (
                  <path
                    key={"v" + i}
                    d={"M" + (i * 72 + 10) + " 0 L" + (i * 72 - 20) + " 400"}
                    stroke="#fff"
                    strokeWidth="4"
                    fill="none"
                  />
                ))}
              </svg>
              {records.map((area, i) => {
                const p = coordinates[area.name] ?? { x: 30 + i * 20, y: 47 };
                const isSelected = selection?.id === area.id;
                return (
                  <button
                    type="button"
                    key={area.id}
                    aria-pressed={isSelected}
                    onClick={() => setSelected(area.id)}
                    className={cn(
                      "absolute flex min-h-11 -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full border-2 border-white px-3 text-sm font-semibold shadow-raised focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal",
                      isSelected ? "bg-ink text-white" : "bg-signal text-white",
                    )}
                    style={{ left: p.x + "%", top: p.y + "%" }}
                  >
                    <MapPin className="size-4" aria-hidden />
                    {area.name}
                  </button>
                );
              })}
              <span className="absolute bottom-3 left-3 rounded-md bg-surface px-2.5 py-1.5 text-xs text-ink-muted">
                Schematic. Not a real map.
              </span>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {records.map((area) => (
                <li key={area.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(area.id)}
                    aria-pressed={selection?.id === area.id}
                    className={cn(
                      "flex min-h-16 w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm hover:bg-paper focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-signal",
                      selection?.id === area.id && "bg-signal-soft",
                    )}
                  >
                    <span className="font-semibold text-ink">
                      {area.name}
                      <span className="block font-normal text-ink-muted">
                        Zone {area.zone}, {city}
                      </span>
                    </span>
                    <span className="text-ink-muted tabular-nums">
                      {count(area.id)} sample screens
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {!records.length ? (
            <p className="p-5 text-sm text-ink-muted">
              No sample areas for {city}. That doesn&apos;t mean AdVibe can&apos;t run there: ask us
              about it from the contact page.
            </p>
          ) : null}
        </div>

        <div className="h-fit rounded-lg border border-line bg-surface p-5">
          {selection ? (
            <>
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-heading text-xl font-semibold text-ink">
                  {selection.name}, {selection.city}
                </h3>
                <StatusBadge tone="neutral">Sample</StatusBadge>
              </div>
              <dl className="mt-4 divide-y divide-line border-y border-line text-sm">
                {[
                  ["Zone", selection.zone],
                  ["Sample screens", String(count(selection.id))],
                  ["Availability", "Confirmed when you plan a campaign"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 py-2.5">
                    <dt className="text-ink-muted">{k}</dt>
                    <dd className="text-right font-medium text-ink tabular-nums">{v}</dd>
                  </div>
                ))}
              </dl>
              <Link href="/signup?role=advertiser" className={cn(outlineButton, "mt-5 w-full")}>
                Create an advertiser account
              </Link>
            </>
          ) : (
            <>
              <h3 className="font-heading text-lg font-semibold text-ink">
                No sample area selected
              </h3>
              <p className="mt-2 text-base text-ink-muted">
                Only Prayagraj and Lucknow have sample areas here. Contact us to ask about other
                cities.
              </p>
            </>
          )}
        </div>
      </div>
      <InfoNote>
        Areas and screen counts on this page are fictional samples that show how planning works.
        They are not live inventory, real coordinates or a list of cities where AdVibe operates.
      </InfoNote>
    </div>
  );
}
