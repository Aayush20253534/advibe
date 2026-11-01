import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/** Status colours always come with a text label, never colour alone. */
export const badgeVariants = cva(
  "inline-flex max-w-full items-center gap-1.5 border px-2 py-0.5 text-xs leading-5 font-semibold whitespace-nowrap",
  {
    variants: {
      tone: {
        neutral: "border-line bg-surface-sunken text-[#3e4c63]",
        info: "border-info-border bg-info-bg text-info-fg",
        success: "border-success-border bg-success-bg text-success-fg",
        warning: "border-warning-border bg-warning-bg text-warning-fg",
        danger: "border-danger-border bg-danger-bg text-danger-fg",
        live: "border-beacon bg-[#fff1e6] text-ink",
        // Legacy tones kept for unmigrated screens; they map onto the semantic set.
        purple: "border-info-border bg-info-bg text-info-fg",
        orange: "border-warning-border bg-warning-bg text-warning-fg",
      },
      shape: { soft: "rounded-md", pill: "rounded-full" },
    },
    defaultVariants: { tone: "neutral", shape: "soft" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ tone, shape, className, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone, shape }), className)} {...props} />;
}

export type StatusTone = "neutral" | "info" | "success" | "warning" | "danger" | "live";

const dot: Record<StatusTone, string> = {
  neutral: "bg-[#6b7a94]",
  info: "bg-info-fg",
  success: "bg-success-fg",
  warning: "bg-warning-fg",
  danger: "bg-danger-fg",
  live: "bg-beacon",
};

/** Operational status: a coloured dot plus a plain-language label. */
export function StatusBadge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: StatusTone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Badge tone={tone} shape="pill" className={className}>
      <span aria-hidden className={cn("size-1.5 rounded-full", dot[tone])} />
      {children}
    </Badge>
  );
}
