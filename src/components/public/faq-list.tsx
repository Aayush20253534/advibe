"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { publicFAQs, type PublicFAQ } from "./faq-data";

/** Native disclosure list: keyboard and screen-reader friendly without scripts. */
export function FAQList({ items = publicFAQs }: { items?: PublicFAQ[] }) {
  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((faq) => (
        <details key={faq.question} className="group">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 text-left text-base font-semibold text-ink marker:content-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal">
            {faq.question}
            <ChevronDown
              className="size-5 shrink-0 text-ink-muted transition-transform group-open:rotate-180"
              aria-hidden
            />
          </summary>
          <p className="pr-8 pb-4 text-base text-ink-muted">{faq.answer}</p>
        </details>
      ))}
    </div>
  );
}
