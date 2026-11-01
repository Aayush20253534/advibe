import * as React from "react";
import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export type AlertTone = "info" | "success" | "warning" | "danger";

const tones: Record<AlertTone, { box: string; icon: React.ElementType }> = {
  info: { box: "border-info-border bg-info-bg text-info-fg", icon: Info },
  success: { box: "border-success-border bg-success-bg text-success-fg", icon: CircleCheck },
  warning: { box: "border-warning-border bg-warning-bg text-warning-fg", icon: TriangleAlert },
  danger: { box: "border-danger-border bg-danger-bg text-danger-fg", icon: CircleAlert },
};

/**
 * Inline message. Danger alerts are announced immediately (role="alert");
 * the others politely (role="status"). Say what happened and what to do next.
 */
export function Alert({
  tone = "info",
  title,
  children,
  action,
  className,
}: {
  tone?: AlertTone;
  title?: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  const { box, icon: Icon } = tones[tone];
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cn("flex gap-3 rounded-lg border p-4 text-sm", box, className)}
    >
      <Icon className="mt-0.5 size-5 shrink-0" aria-hidden />
      <div className="min-w-0 flex-1">
        {title ? <p className="font-semibold">{title}</p> : null}
        {children ? <div className={cn("text-ink", title && "mt-1")}>{children}</div> : null}
        {action ? <div className="mt-3 flex flex-wrap gap-2">{action}</div> : null}
      </div>
    </div>
  );
}
