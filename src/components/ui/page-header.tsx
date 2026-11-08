import * as React from "react";
import { cn } from "@/lib/utils";
import { Breadcrumbs, type Crumb } from "./breadcrumbs";

/** One h1 per page, sentence case, with the page's main actions on the right. */
export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  className,
}: {
  title: string;
  description?: React.ReactNode;
  breadcrumbs?: readonly Crumb[];
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("flex flex-col gap-3", className)}>
      {breadcrumbs?.length ? <Breadcrumbs items={breadcrumbs} /> : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-heading text-2xl font-bold tracking-[-.035em] text-ink sm:text-[28px]">{title}</h1>
          {description ? (
            <div className="mt-1 max-w-2xl text-sm leading-6 text-ink-muted">{description}</div>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}
