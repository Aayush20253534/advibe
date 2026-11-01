"use client";

import * as React from "react";
import Link from "next/link";
import { Monitor, Target } from "lucide-react";
import { FormatPreviewArt } from "@/components/landing/format-preview-art";
import { Tabs } from "@/components/ui";
import { cn } from "@/lib/utils";
import { formatCards, InfoNote, outlineButton, primaryButton } from "./marketing-blocks";

const extras = [
  {
    title: "Auto rickshaw side screen",
    type: "auto_side" as const,
    description: "A side-facing screen seen by pedestrians and shops along the street.",
    spec: "Placement-specific screen",
    best: "Street-level campaigns",
  },
  {
    title: "Car rear screen",
    type: "car_rear" as const,
    description: "A rear-window screen seen by the traffic behind the car.",
    spec: "Placement-specific screen",
    best: "City-wide awareness",
  },
];
const all = [...formatCards, ...extras];
type CatalogItem = (typeof all)[number];
type Filter = "all" | "bike" | "auto" | "car" | "other";

const filters: { value: Filter; label: string }[] = [
  { value: "all", label: "All formats" },
  { value: "bike", label: "Bike" },
  { value: "auto", label: "Auto rickshaw" },
  { value: "car", label: "Car" },
  { value: "other", label: "Other" },
];

export function FormatCatalogue() {
  const [filter, setFilter] = React.useState<Filter>("all");
  const [selected, setSelected] = React.useState<CatalogItem>(all[1]!);
  const visible = all.filter(
    (item) =>
      filter === "all" ||
      (filter === "bike" && item.type === "bike_rear") ||
      (filter === "auto" && item.type.startsWith("auto")) ||
      (filter === "car" && item.type.startsWith("car")) ||
      (filter === "other" && item.type === "helmet"),
  );
  return (
    <div className="space-y-8">
      <Tabs
        label="Filter formats by vehicle"
        tabs={filters}
        value={filter}
        onValueChange={(v) => setFilter(v as Filter)}
      />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(300px,0.8fr)]">
        <ul className="grid gap-6 sm:grid-cols-2">
          {visible.map((item) => {
            const isSelected = selected.type === item.type;
            return (
              <li key={item.type} id={item.type} className="scroll-mt-24">
                <div
                  className={cn(
                    "rounded-lg border bg-surface p-3",
                    isSelected ? "border-signal ring-1 ring-signal" : "border-line",
                  )}
                >
                  <div className="aspect-[1.75] overflow-hidden rounded-md">
                    <FormatPreviewArt type={item.type} />
                  </div>
                  <h3 className="mt-4 font-heading text-lg font-semibold text-ink">{item.title}</h3>
                  <p className="mt-1 text-sm text-ink-muted">{item.description}</p>
                  <dl className="mt-3 space-y-1.5 text-sm text-ink">
                    <div className="flex items-center gap-2">
                      <Monitor className="size-4 text-ink-muted" aria-hidden />
                      <dt className="sr-only">Screen</dt>
                      <dd>{item.spec}</dd>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="size-4 text-ink-muted" aria-hidden />
                      <dt className="sr-only">Works well for</dt>
                      <dd>{item.best}</dd>
                    </div>
                  </dl>
                  <button
                    type="button"
                    onClick={() => setSelected(item)}
                    aria-pressed={isSelected}
                    className={cn(
                      "mt-4 min-h-11 w-full rounded-lg border text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal",
                      isSelected
                        ? "border-signal bg-signal text-white"
                        : "border-line-strong text-ink hover:bg-paper",
                    )}
                  >
                    {isSelected ? "Showing details" : "Show details"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
        <aside
          aria-labelledby="format-details"
          className="h-fit rounded-lg border border-line bg-surface p-5 lg:sticky lg:top-24"
        >
          <h2 id="format-details" className="font-heading text-lg font-semibold text-ink">
            {selected.title}
          </h2>
          <div className="mt-4 overflow-hidden rounded-md">
            <FormatPreviewArt type={selected.type} />
          </div>
          <p className="mt-4 text-base text-ink-muted">{selected.description}</p>
          <dl className="mt-5 divide-y divide-line border-y border-line text-sm">
            {[
              ["Example screen", selected.spec],
              ["Works well for", selected.best],
              ["Hardware", "Confirmed per campaign"],
              ["Creative files", "Checked by an admin before scheduling"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 py-2.5">
                <dt className="text-ink-muted">{k}</dt>
                <dd className="text-right font-medium text-ink">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-5 flex flex-col gap-2">
            <Link
              href={"/pricing?format=" + encodeURIComponent(selected.type)}
              className={primaryButton}
            >
              Estimate the cost of this format
            </Link>
            <Link href="/signup?role=advertiser" className={outlineButton}>
              Create an advertiser account
            </Link>
          </div>
        </aside>
      </div>
      <InfoNote>
        The drawings show where each placement sits. Exact screen sizes, hardware and availability
        are confirmed for each campaign before it is booked.
      </InfoNote>
    </div>
  );
}
