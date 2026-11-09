"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Info, Layers3, Monitor, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCards } from "./marketing-blocks";

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
const photos = {
  bike_rear: {
    file: "bike-rear",
    alt: "Illustration of a compact rear-facing screen mounted behind a white scooter's seat",
  },
  auto_rear: {
    file: "auto-rear",
    alt: "Illustration of a blue advertising screen on the rear of a white auto rickshaw",
  },
  car_interior: {
    file: "car-interior",
    alt: "Illustration of a blue advertising screen on the back of a car headrest",
  },
  helmet: {
    file: "helmet",
    alt: "Illustration of a white helmet with a blue printed advertising wrap, not a digital screen",
  },
  auto_side: {
    file: "auto-side",
    alt: "Illustration of a screen on the passenger side of a white auto rickshaw",
  },
  car_rear: {
    file: "car-rear",
    alt: "Illustration of a blue advertising display in the rear window of a white car",
  },
};
function matchesFilter(item: CatalogItem, filter: Filter) {
  return (
    filter === "all" ||
    (filter === "bike" && item.type === "bike_rear") ||
    (filter === "auto" && item.type.startsWith("auto")) ||
    (filter === "car" && item.type.startsWith("car")) ||
    (filter === "other" && item.type === "helmet")
  );
}
function PlacementPhoto({ item, detail = false }: { item: CatalogItem; detail?: boolean }) {
  const photo = photos[item.type];
  return (
    <Image
      src={`/images/blinkmyad/ad-formats/${photo.file}.webp`}
      alt={photo.alt}
      fill
      sizes={
        detail
          ? "(min-width: 1180px) 330px, (min-width: 700px) 50vw, 100vw"
          : "(min-width: 1440px) 300px, (min-width: 1180px) 22vw, (min-width: 700px) 30vw, (min-width: 480px) 45vw, 100vw"
      }
      className="bma-format-photo"
    />
  );
}

export function FormatCatalogue() {
  const [filter, setFilter] = React.useState<Filter>("all");
  const [selected, setSelected] = React.useState<CatalogItem>(all[1]!);
  const detailsRef = React.useRef<HTMLElement>(null);
  const visible = all.filter((item) => matchesFilter(item, filter));
  function changeFilter(value: Filter) {
    setFilter(value);
    if (!matchesFilter(selected, value))
      setSelected(all.find((item) => matchesFilter(item, value))!);
  }
  function showDetails(item: CatalogItem) {
    setSelected(item);
    // A stacked detail panel needs an explicit destination on mobile and tablet.
    if (window.matchMedia("(max-width: 1179px)").matches) {
      window.requestAnimationFrame(() => {
        detailsRef.current?.focus({ preventScroll: true });
        detailsRef.current?.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "instant"
            : "smooth",
          block: "start",
        });
      });
    }
  }
  return (
    <div className="bma-format-catalogue">
      <div className="bma-format-filters" role="group" aria-label="Filter formats by vehicle">
        {filters.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            aria-pressed={filter === value}
            onClick={() => changeFilter(value)}
          >
            {label}
          </button>
        ))}
      </div>
      <p className="sr-only" role="status">
        {visible.length} {visible.length === 1 ? "format" : "formats"} shown. Selected format:{" "}
        {selected.title}.
      </p>
      <div className="bma-format-layout">
        <ul className="bma-format-grid" aria-label="Ad formats">
          {visible.map((item) => {
            const isSelected = selected.type === item.type;
            const SpecIcon = item.type === "helmet" ? Layers3 : Monitor;
            return (
              <li key={item.type} id={item.type}>
                <article className={cn("bma-format-card", isSelected && "is-selected")}>
                  <div className="bma-format-card-image">
                    <PlacementPhoto item={item} />
                    {isSelected && (
                      <span className="bma-format-selected-mark" aria-label="Selected format">
                        <Check aria-hidden="true" />
                      </span>
                    )}
                  </div>
                  <div className="bma-format-card-copy">
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                    <dl>
                      <div>
                        <SpecIcon aria-hidden="true" />
                        <dt className="sr-only">
                          {item.type === "helmet" ? "Example placement" : "Example screen"}
                        </dt>
                        <dd>{item.spec}</dd>
                      </div>
                      <div>
                        <Target aria-hidden="true" />
                        <dt className="sr-only">Works well for</dt>
                        <dd>{item.best}</dd>
                      </div>
                    </dl>
                    <button
                      type="button"
                      onClick={() => showDetails(item)}
                      aria-label={`View details: ${item.title}`}
                      aria-pressed={isSelected}
                      aria-controls="selected-format-panel"
                      className="bma-format-details-button"
                    >
                      View details <ArrowRight aria-hidden="true" />
                    </button>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
        <aside
          id="selected-format-panel"
          ref={detailsRef}
          tabIndex={-1}
          aria-labelledby="format-details"
          className="bma-format-detail"
        >
          <h3 id="format-details">{selected.title}</h3>
          <div className="bma-format-detail-image">
            <PlacementPhoto item={selected} detail />
          </div>
          <p className="bma-format-detail-description">{selected.description}</p>
          <dl>
            {[
              [selected.type === "helmet" ? "Example placement" : "Example screen", selected.spec],
              ["Works well for", selected.best],
              ["Hardware", "Confirmed per campaign"],
              ["Creative files", "Checked by an admin before scheduling"],
            ].map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <Link
            href={"/pricing?format=" + encodeURIComponent(selected.type)}
            className="bma-formats-button bma-format-estimate"
            aria-label={`Estimate the cost of this format: ${selected.title}`}
          >
            Estimate cost <ArrowRight aria-hidden="true" />
          </Link>
          <Link href="/signup?role=advertiser" className="bma-format-account-link">
            Create an advertiser account <ArrowRight aria-hidden="true" />
          </Link>
        </aside>
      </div>
      <div className="bma-formats-notice">
        <Info aria-hidden="true" />
        <p>
          The images are illustrations of how each placement could look, not photos of installed
          BlinkMyAd screens. Exact screen sizes, hardware and availability are confirmed for each
          campaign before it is booked.
        </p>
      </div>
    </div>
  );
}
