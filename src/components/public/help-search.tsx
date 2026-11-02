"use client";

import * as React from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Button, Input, Tabs } from "@/components/ui";
import { FAQList } from "./faq-list";
import { publicFAQs } from "./faq-data";
import { textLink } from "./marketing-blocks";

const categories = [
  { value: "all", label: "All topics" },
  { value: "General", label: "General" },
  { value: "Advertisers", label: "Advertisers" },
  { value: "Drivers", label: "Drivers" },
  { value: "Payments", label: "Payments" },
  { value: "Technical", label: "Technical" },
] as const;

const guides = [
  { label: "How a campaign works", href: "/for-advertisers" },
  { label: "Choosing an ad format", href: "/ad-formats" },
  { label: "Estimating the cost", href: "/pricing" },
  { label: "Becoming a driver partner", href: "/for-drivers" },
  { label: "Prayagraj locations", href: "/locations" },
  { label: "Contacting AdVibe", href: "/contact" },
];

export function HelpSearch() {
  const [text, setText] = React.useState("");
  const [category, setCategory] = React.useState<string>("all");
  const filtered = publicFAQs.filter(
    (x) =>
      (category === "all" || x.category === category) &&
      (!text.trim() ||
        (x.question + " " + x.answer + " " + x.category)
          .toLowerCase()
          .includes(text.toLowerCase())),
  );
  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,1.5fr)_minmax(240px,0.6fr)]">
      <div className="min-w-0">
        <label htmlFor="help-search" className="font-heading text-lg font-semibold text-ink">
          Search questions
        </label>
        <div className="relative mt-2">
          <Search
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-ink-muted"
          />
          <Input
            id="help-search"
            type="search"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="For example: creative, payout, pricing"
            className="min-h-12 pl-10"
          />
        </div>
        <Tabs
          label="Help topics"
          tabs={categories}
          value={category}
          onValueChange={setCategory}
          className="mt-4"
        />
        <p aria-live="polite" className="mt-6 text-sm text-ink-muted">
          {filtered.length} {filtered.length === 1 ? "question" : "questions"}
        </p>
        <div className="mt-2">
          {filtered.length ? (
            <FAQList items={filtered} />
          ) : (
            <div className="rounded-lg border border-line bg-surface p-6">
              <p className="text-base text-ink">No questions match “{text}”.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setText("");
                  setCategory("all");
                }}
              >
                Clear search and show all questions
              </Button>
            </div>
          )}
        </div>
      </div>
      <aside className="space-y-8">
        <div>
          <h2 className="font-heading text-lg font-semibold text-ink">Guides</h2>
          <ul className="mt-3 space-y-3">
            {guides.map((g) => (
              <li key={g.href}>
                <Link href={g.href} className={textLink}>
                  {g.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-line bg-surface p-5">
          <h2 className="font-heading text-lg font-semibold text-ink">Still stuck?</h2>
          <p className="mt-2 text-base text-ink-muted">
            Signed-in users can open a ticket from their portal. Everyone else can write to us.
          </p>
          <Link href="/contact" className={textLink + " mt-3 inline-block"}>
            Contact AdVibe
          </Link>
        </div>
      </aside>
    </div>
  );
}
