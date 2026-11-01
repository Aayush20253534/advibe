import * as React from "react";
import { cn } from "@/lib/utils";

/** Loading placeholder. Pulses only when the user allows motion. */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden
      className={cn("rounded-md bg-surface-sunken motion-safe:animate-pulse", className)}
      {...props}
    />
  );
}

/** Announces loading to screen readers while showing placeholder rows. */
export function SkeletonList({ rows = 3, label = "Loading" }: { rows?: number; label?: string }) {
  return (
    <div role="status" aria-live="polite" className="space-y-3">
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}
