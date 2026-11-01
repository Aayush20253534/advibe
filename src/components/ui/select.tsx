import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { controlClass } from "./input";

/** Native select (best keyboard and mobile support) with a consistent chevron. */
export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <div className="relative min-w-0">
    <select
      ref={ref}
      className={cn(controlClass, "min-h-11 appearance-none py-2 pr-10", className)}
      {...props}
    >
      {children}
    </select>
    <ChevronDown
      aria-hidden
      className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-ink-muted"
    />
  </div>
));
Select.displayName = "Select";
