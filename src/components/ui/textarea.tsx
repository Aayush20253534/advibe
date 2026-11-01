import * as React from "react";
import { cn } from "@/lib/utils";
import { controlClass } from "./input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(controlClass, "min-h-28 resize-y py-2.5 leading-6", className)}
    {...props}
  />
));
Textarea.displayName = "Textarea";
