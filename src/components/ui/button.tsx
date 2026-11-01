import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Buttons say exactly what happens ("Submit for review", not "Submit").
 * primary: the one action colour (signal) in every portal.
 * brand: beacon orange, reserved for the main marketing call to action; always ink text.
 */
export const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-lg font-semibold whitespace-nowrap transition-colors duration-150 select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal disabled:pointer-events-none disabled:opacity-50 aria-busy:cursor-progress",
  {
    variants: {
      variant: {
        primary: "bg-signal text-white hover:bg-signal-hover",
        brand: "bg-brand-orange text-brand-navy hover:bg-beacon-hover",
        secondary: "bg-signal-soft text-ink hover:bg-[#d9e6fd]",
        outline: "border border-line-strong bg-surface text-ink hover:bg-paper",
        ghost: "bg-transparent text-ink hover:bg-surface-sunken",
        destructive: "bg-danger-solid text-white hover:bg-[#a51f15]",
        link: "h-auto min-h-0 rounded-none px-0 text-signal underline-offset-4 hover:underline",
      },
      size: {
        sm: "min-h-9 px-3 text-sm",
        md: "min-h-11 px-4 text-sm",
        lg: "min-h-12 px-6 text-base",
        icon: "size-11 min-h-11 px-0",
        "icon-sm": "size-9 min-h-9 px-0",
      },
    },
    compoundVariants: [{ variant: "link", className: "min-h-0 px-0" }],
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  /** Shows a spinner, disables the button and announces the busy state. */
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, loading = false, disabled, children, type = "button", ...props },
    ref,
  ) => (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <LoaderCircle className="size-4 motion-safe:animate-spin" aria-hidden /> : null}
      {children}
    </button>
  ),
);
Button.displayName = "Button";
