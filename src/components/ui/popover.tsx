"use client";

import * as React from "react";
import * as RadixPopover from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";

/** Non-modal panel anchored to a trigger, e.g. a filter or a short explanation. */
export function Popover({
  trigger,
  children,
  label,
  className,
  align = "start",
}: {
  /** A single focusable element, usually a Button. */
  trigger: React.ReactElement;
  children: React.ReactNode;
  /** Accessible name for the panel. */
  label: string;
  className?: string;
  align?: "start" | "center" | "end";
}) {
  return (
    <RadixPopover.Root>
      <RadixPopover.Trigger asChild>{trigger}</RadixPopover.Trigger>
      <RadixPopover.Portal>
        <RadixPopover.Content
          aria-label={label}
          align={align}
          sideOffset={6}
          collisionPadding={16}
          className={cn(
            "z-50 w-72 max-w-[calc(100vw-2rem)] rounded-lg border border-line bg-surface p-4 text-sm text-ink shadow-overlay focus-visible:outline-2 focus-visible:outline-signal",
            className,
          )}
        >
          {children}
        </RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  );
}
