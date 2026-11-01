"use client";

import * as React from "react";
import * as RadixDialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export type DialogProps = {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
};

/**
 * These dialogs are opened from state rather than a Radix trigger, so Radix has
 * no trigger to refocus. Remember what had focus when the dialog opened and
 * return focus there when it closes (WCAG 2.4.3 focus order).
 */
function useReturnFocus(open: boolean) {
  const previous = React.useRef<HTMLElement | null>(null);
  // Layout effects run before Radix moves focus into the dialog (a passive effect).
  React.useLayoutEffect(() => {
    if (open) previous.current = document.activeElement as HTMLElement | null;
  }, [open]);
  return React.useCallback((event: Event) => {
    const target = previous.current;
    previous.current = null;
    if (target && target.isConnected) {
      event.preventDefault();
      target.focus();
    }
  }, []);
}

const overlayClass =
  "fixed inset-0 z-50 bg-ink/60 motion-safe:data-[state=open]:animate-[advibe-fade-in_150ms_ease-out]";

/**
 * Modal dialog. Traps focus, closes on Escape and returns focus to the trigger.
 * Use for confirmations ("Reject creative?") and short forms.
 */
export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
}: DialogProps) {
  const onCloseAutoFocus = useReturnFocus(open);
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className={overlayClass} />
        <RadixDialog.Content
          onCloseAutoFocus={onCloseAutoFocus}
          {...(description ? {} : { "aria-describedby": undefined })}
          className={cn(
            "fixed top-1/2 left-1/2 z-50 flex max-h-[min(90dvh,800px)] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col rounded-lg border border-line bg-surface text-ink shadow-overlay focus-visible:outline-none motion-safe:data-[state=open]:animate-[advibe-rise-in_160ms_ease-out]",
            className,
          )}
        >
          <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
            <div className="min-w-0">
              <RadixDialog.Title className="font-heading text-lg font-semibold">
                {title}
              </RadixDialog.Title>
              {description ? (
                <RadixDialog.Description className="mt-1 text-sm text-ink-muted">
                  {description}
                </RadixDialog.Description>
              ) : null}
            </div>
            <RadixDialog.Close
              aria-label="Close dialog"
              className="grid size-9 shrink-0 place-items-center rounded-md text-ink-muted hover:bg-surface-sunken hover:text-ink focus-visible:outline-2 focus-visible:outline-signal"
            >
              <X className="size-5" aria-hidden />
            </RadixDialog.Close>
          </div>
          <div className="overflow-y-auto px-5 py-5">{children}</div>
          {footer ? (
            <div className="flex flex-wrap justify-end gap-2 border-t border-line px-5 py-4">
              {footer}
            </div>
          ) : null}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}

/**
 * Side sheet for detail views and filters. Slides from the right on wide screens
 * and fills the width on phones.
 */
export function Drawer({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
}: DialogProps) {
  const onCloseAutoFocus = useReturnFocus(open);
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className={overlayClass} />
        <RadixDialog.Content
          onCloseAutoFocus={onCloseAutoFocus}
          {...(description ? {} : { "aria-describedby": undefined })}
          className={cn(
            "fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-line bg-surface text-ink shadow-overlay focus-visible:outline-none motion-safe:data-[state=open]:animate-[advibe-slide-in_180ms_ease-out]",
            className,
          )}
        >
          <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
            <div className="min-w-0">
              <RadixDialog.Title className="font-heading text-lg font-semibold">
                {title}
              </RadixDialog.Title>
              {description ? (
                <RadixDialog.Description className="mt-1 text-sm text-ink-muted">
                  {description}
                </RadixDialog.Description>
              ) : null}
            </div>
            <RadixDialog.Close
              aria-label="Close panel"
              className="grid size-9 shrink-0 place-items-center rounded-md text-ink-muted hover:bg-surface-sunken hover:text-ink focus-visible:outline-2 focus-visible:outline-signal"
            >
              <X className="size-5" aria-hidden />
            </RadixDialog.Close>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
          {footer ? (
            <div className="flex flex-wrap justify-end gap-2 border-t border-line px-5 py-4">
              {footer}
            </div>
          ) : null}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
