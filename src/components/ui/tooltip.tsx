"use client";

import * as React from "react";
import * as RadixTooltip from "@radix-ui/react-tooltip";

/**
 * Short supplementary label on hover and keyboard focus. Never put essential
 * information or interactive content in a tooltip; phones cannot hover.
 */
export function Tooltip({ content, children }: { content: string; children: React.ReactElement }) {
  return (
    <RadixTooltip.Provider delayDuration={300}>
      <RadixTooltip.Root>
        <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            sideOffset={6}
            collisionPadding={8}
            className="z-50 max-w-xs rounded-md bg-ink px-2.5 py-1.5 text-xs leading-5 text-white shadow-overlay"
          >
            {content}
            <RadixTooltip.Arrow className="fill-ink" />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
}
