"use client";

import * as React from "react";
import * as RadixTabs from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

export type Tab = { value: string; label: string };

type TabsProps = {
  tabs: readonly Tab[];
  value: string;
  onValueChange: (value: string) => void;
  label: string;
  className?: string;
};

/**
 * Segmented choice (for example a status filter). A group of pressed buttons
 * with arrow-key movement. For switching between content panels, use TabsRoot.
 */
export function Tabs({ tabs, value, onValueChange, label, className }: TabsProps) {
  const refs = React.useRef<Array<HTMLButtonElement | null>>([]);
  const select = (i: number) => {
    const tab = tabs[i];
    if (tab) {
      onValueChange(tab.value);
      refs.current[i]?.focus();
    }
  };

  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "inline-flex max-w-full gap-1 overflow-x-auto rounded-lg border border-line bg-surface-sunken p-1",
        className,
      )}
    >
      {tabs.map((tab, index) => (
        <button
          key={tab.value}
          ref={(element) => {
            refs.current[index] = element;
          }}
          type="button"
          aria-pressed={value === tab.value}
          onClick={() => onValueChange(tab.value)}
          onKeyDown={(event) => {
            if (event.key === "ArrowRight") {
              event.preventDefault();
              select((index + 1) % tabs.length);
            }
            if (event.key === "ArrowLeft") {
              event.preventDefault();
              select((index - 1 + tabs.length) % tabs.length);
            }
            if (event.key === "Home") {
              event.preventDefault();
              select(0);
            }
            if (event.key === "End") {
              event.preventDefault();
              select(tabs.length - 1);
            }
          }}
          className={cn(
            "min-h-11 shrink-0 rounded-md px-3 text-sm font-semibold sm:min-h-9 transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-signal",
            value === tab.value
              ? "bg-surface text-ink shadow-raised"
              : "text-ink-muted hover:text-ink",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

/** Real tab panels (Radix): arrow keys move between tabs, Tab moves into the panel. */
export const TabsRoot = RadixTabs.Root;

export function TabsList({ className, ...props }: React.ComponentProps<typeof RadixTabs.List>) {
  return (
    <RadixTabs.List
      className={cn("flex max-w-full gap-1 overflow-x-auto border-b border-line", className)}
      {...props}
    />
  );
}

export function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof RadixTabs.Trigger>) {
  return (
    <RadixTabs.Trigger
      className={cn(
        "-mb-px min-h-11 shrink-0 border-b-2 border-transparent px-3 text-sm font-semibold text-ink-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-signal data-[state=active]:border-signal data-[state=active]:text-ink",
        className,
      )}
      {...props}
    />
  );
}

export function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof RadixTabs.Content>) {
  return (
    <RadixTabs.Content
      className={cn(
        "pt-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal",
        className,
      )}
      {...props}
    />
  );
}
