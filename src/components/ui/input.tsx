import * as React from "react";
import { cn } from "@/lib/utils";

/** Shared look for text-like controls: 44px tall, 3:1 border, visible focus and error state. */
export const controlClass =
  "w-full min-w-0 rounded-md border border-line-strong bg-surface px-3 text-base text-ink placeholder:text-ink-subtle hover:border-ink-muted focus-visible:border-signal focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-signal disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-ink-muted aria-invalid:border-danger-fg sm:text-sm";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", invalid = false, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      aria-invalid={invalid || undefined}
      className={cn(controlClass, "min-h-11 py-2", className)}
      {...props}
    />
  ),
);
Input.displayName = "Input";

/** Native date picker: keyboard accessible and localised by the browser. */
export const DateInput = React.forwardRef<HTMLInputElement, Omit<InputProps, "type">>(
  (props, ref) => <Input ref={ref} type="date" {...props} />,
);
DateInput.displayName = "DateInput";
