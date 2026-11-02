"use client";

import * as React from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { FormatPreviewArt } from "@/components/landing/format-preview-art";
import { Tabs } from "@/components/ui";
import type { Placement } from "@/types/domain";
import { primaryButton } from "./marketing-blocks";

const options: {
  key: string;
  name: string;
  type: Placement;
  description: string;
  points: string[];
}[] = [
  {
    key: "bike",
    name: "Bike",
    type: "bike_rear",
    description: "A compact screen mounted behind the rider.",
    points: [
      "Two-wheeler in good condition",
      "Screen mounted behind the seat",
      "Earnings depend on assigned campaigns",
    ],
  },
  {
    key: "auto",
    name: "Auto rickshaw",
    type: "auto_rear",
    description: "A screen on the back or side of the auto.",
    points: [
      "Rear or side placement",
      "Local routes suit neighbourhood campaigns",
      "Verified before any ad is assigned",
    ],
  },
  {
    key: "car",
    name: "Car",
    type: "car_interior",
    description: "A seat-back screen that passengers see.",
    points: [
      "Passenger-facing screen",
      "Suits ride-hailing and taxi cars",
      "Installed after your application is approved",
    ],
  },
];

export function DriverVehicleTabs() {
  const [current, setCurrent] = React.useState("bike");
  const selected = options.find((x) => x.key === current) ?? options[0]!;
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.8fr)]">
      <div>
        <Tabs
          label="Vehicle type"
          tabs={options.map((o) => ({ value: o.key, label: o.name }))}
          value={current}
          onValueChange={setCurrent}
        />
        <div className="mt-6 grid gap-6 sm:grid-cols-[1.2fr_1fr]">
          <div className="aspect-[1.75] overflow-hidden rounded-lg border border-line">
            <FormatPreviewArt type={selected.type} />
          </div>
          <div>
            <h3 className="font-heading text-xl font-semibold text-ink">{selected.name}</h3>
            <p className="mt-1 text-base text-ink-muted">{selected.description}</p>
            <ul className="mt-4 space-y-2">
              {selected.points.map((point) => (
                <li key={point} className="flex items-start gap-2 text-base text-ink">
                  <Check className="mt-1 size-4 shrink-0 text-success-fg" aria-hidden />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <aside className="rounded-lg bg-night p-6 text-white">
        <h3 className="font-heading text-xl font-semibold">What you can earn</h3>
        <p className="mt-3 text-base text-[#c3d0e4]">
          Earnings depend on your vehicle, your routes in Prayagraj, the campaigns assigned to your screen, how
          long the screen is online and your partner agreement.
        </p>
        <p className="mt-4 rounded-lg border border-white/25 p-4 text-sm">
          AdVibe does not publish a guaranteed monthly amount. You see the confirmed rate in your
          agreement before you sign.
        </p>
        <Link href="/signup?role=driver" className={primaryButton + " mt-6 w-full"}>
          Apply as a driver partner
        </Link>
      </aside>
    </div>
  );
}
