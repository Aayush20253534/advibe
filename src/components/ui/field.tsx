import * as React from "react";
import { CircleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

type FieldProps = {
  label: string;
  htmlFor: string;
  description?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
};

type WirableProps = {
  id?: string;
  required?: boolean;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
};

/**
 * Label, optional hint and validation message for one control.
 * When the child is a single element, Field sets its id, aria-describedby,
 * aria-invalid and required so the hint and error are announced.
 */
export function Field({
  label,
  htmlFor,
  description,
  error,
  required,
  children,
  className,
}: FieldProps) {
  const descriptionId = description ? htmlFor + "-description" : undefined;
  const errorId = error ? htmlFor + "-error" : undefined;
  const describedBy = [descriptionId, errorId].filter(Boolean).join(" ") || undefined;
  const control = React.isValidElement<WirableProps>(children)
    ? React.cloneElement(children, {
        id: children.props.id ?? htmlFor,
        required: children.props.required ?? required,
        "aria-describedby":
          [children.props["aria-describedby"], describedBy].filter(Boolean).join(" ") || undefined,
        "aria-invalid": error ? true : children.props["aria-invalid"],
      })
    : children;
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-sm font-semibold text-ink">
        {label}
        {required ? <span className="ml-1 font-normal text-ink-muted">(required)</span> : null}
      </label>
      {description ? (
        <p id={descriptionId} className="text-sm text-ink-muted">
          {description}
        </p>
      ) : null}
      {control}
      {error ? (
        <p id={errorId} className="flex items-start gap-1.5 text-sm font-medium text-danger-fg">
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          {error}
        </p>
      ) : null}
    </div>
  );
}
