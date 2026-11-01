import * as React from "react";
import { cn } from "@/lib/utils";

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: React.ReactNode;
  description?: React.ReactNode;
}

/** Native checkbox with its label as the 44px tap target. */
export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, className, id, ...props }, ref) => {
    const fallbackId = React.useId();
    const inputId = id ?? fallbackId;
    const descriptionId = description ? inputId + "-description" : undefined;
    return (
      <div className={cn("flex min-h-11 items-start gap-3 py-2.5", className)}>
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          aria-describedby={descriptionId}
          className="mt-0.5 size-5 shrink-0 cursor-pointer rounded accent-signal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal disabled:cursor-not-allowed"
          {...props}
        />
        <div className="min-w-0">
          <label htmlFor={inputId} className="cursor-pointer text-sm font-medium text-ink">
            {label}
          </label>
          {description ? (
            <p id={descriptionId} className="text-sm text-ink-muted">
              {description}
            </p>
          ) : null}
        </div>
      </div>
    );
  },
);
Checkbox.displayName = "Checkbox";
