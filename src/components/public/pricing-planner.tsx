"use client";

import * as React from "react";
import Link from "next/link";
import { Field, Input } from "@/components/ui";
import { cn } from "@/lib/utils";
import { formatCards, InfoNote, primaryButton } from "./marketing-blocks";

// Example rates used only by this public calculator. They are not published AdVibe prices.
const base: Record<
  "bike_rear" | "auto_rear" | "auto_side" | "car_rear" | "car_interior" | "helmet",
  number
> = {
  bike_rear: 150,
  auto_rear: 200,
  auto_side: 220,
  car_rear: 300,
  car_interior: 300,
  helmet: 100,
};
const pricingOptions = [
  ...formatCards,
  { ...formatCards[1]!, type: "auto_side" as const, title: "Auto rickshaw side screen" },
  { ...formatCards[2]!, type: "car_rear" as const, title: "Car rear screen" },
];
type Choice = keyof typeof base;
const INR = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

function Range({
  label,
  value,
  unit,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  step: number;
  onChange: (n: number) => void;
}) {
  const id = React.useId();
  return (
    <div className="grid gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-semibold text-ink">
          {label}
        </label>
        <output htmlFor={id} className="text-sm font-semibold text-ink tabular-nums">
          {value} {unit}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-11 w-full accent-signal"
      />
    </div>
  );
}

export function PricingPlanner() {
  const [choice, setChoice] = React.useState<Choice>("bike_rear");
  const city = "Prayagraj";
  const [screens, setScreens] = React.useState(10);
  const [days, setDays] = React.useState(15);
  const [seconds, setSeconds] = React.useState(10);
  const [plays, setPlays] = React.useState(100);
  React.useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const param = new URLSearchParams(window.location.search).get("format");
      if (param && Object.hasOwn(base, param)) setChoice(param as Choice);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);
  const format = pricingOptions.find((x) => x.type === choice) ?? formatCards[0]!;
  const daily = Math.round(base[choice] * (seconds / 10) * (plays / 100));
  const subtotal = daily * screens * days;
  const tax = Math.round(subtotal * 0.18);
  const hasRate = city === "Prayagraj"; // The launch calculator is intentionally single-city.
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(300px,0.9fr)]">
      <div className="rounded-lg border border-line bg-surface p-5 sm:p-6">
        <h2 className="font-heading text-xl font-semibold text-ink">Estimate a campaign</h2>
        <p className="mt-1 text-base text-ink-muted">
          Change the format, size and length of a campaign to see an example cost.
        </p>
        <fieldset className="mt-6">
          <legend className="text-sm font-semibold text-ink">Format</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {pricingOptions.map((f) => (
              <label
                key={f.type}
                className={cn(
                  "flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-lg border px-4 text-sm has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-signal",
                  choice === f.type ? "border-signal bg-signal-soft" : "border-line hover:bg-paper",
                )}
              >
                <span className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="format"
                    value={f.type}
                    checked={choice === f.type}
                    onChange={() => setChoice(f.type as Choice)}
                    className="size-4 accent-signal"
                  />
                  <span className="font-medium text-ink">{f.title}</span>
                </span>
                <span className="text-ink-muted tabular-nums">
                  {INR(base[f.type as Choice])}/day
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <Field label="City" htmlFor="pricing-city">
            <Input id="pricing-city" value="Prayagraj, Uttar Pradesh" readOnly />
          </Field>
          <Range
            label="Screens"
            value={screens}
            unit=""
            min={1}
            max={50}
            step={1}
            onChange={setScreens}
          />
          <Range
            label="Campaign length"
            value={days}
            unit="days"
            min={1}
            max={90}
            step={1}
            onChange={setDays}
          />
          <Range
            label="Ad length"
            value={seconds}
            unit="seconds"
            min={5}
            max={30}
            step={5}
            onChange={setSeconds}
          />
          <Range
            label="Plays per day"
            value={plays}
            unit=""
            min={20}
            max={200}
            step={20}
            onChange={setPlays}
          />
        </div>
        <InfoNote>
          How the example is calculated: daily rate × (ad length ÷ 10 seconds) × (plays ÷ 100) ×
          screens × days, plus 18% GST for illustration. These are not published AdVibe prices; your
          real quote comes from approved Prayagraj rates when you plan a campaign.
        </InfoNote>
      </div>

      <div className="h-fit rounded-lg bg-night p-6 text-white lg:sticky lg:top-24">
        <p className="text-sm text-[#c3d0e4]">Example cost</p>
        {hasRate ? (
          <>
            <p aria-live="polite" className="mt-2 font-heading text-4xl font-bold tabular-nums">
              {INR(subtotal + tax)}
            </p>
            <dl className="mt-6 space-y-3 border-t border-white/20 pt-4 text-sm">
              {[
                ["Format", format.title],
                ["Daily rate", INR(base[choice])],
                ["Adjusted daily rate", INR(daily)],
                ["Screens × days", `${screens} × ${days}`],
                ["Subtotal", INR(subtotal)],
                ["GST (18%, illustrative)", INR(tax)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3">
                  <dt className="text-[#c3d0e4]">{k}</dt>
                  <dd className="text-right font-medium tabular-nums">{v}</dd>
                </div>
              ))}
            </dl>
          </>
        ) : (
          <p className="mt-4 rounded-lg border border-white/25 p-4 text-sm">
            Example rates exist for Prayagraj only. A quote for {city} needs a confirmed rate card.
          </p>
        )}
        <p className="mt-6 text-sm text-[#c3d0e4]">
          This is an estimate. Nothing is booked or charged on this page.
        </p>
        <Link href="/signup?role=advertiser" className={cn(primaryButton, "mt-6 w-full")}>
          Create an advertiser account
        </Link>
      </div>
    </div>
  );
}
