import * as React from "react";
import { CircleCheck, CircleAlert, Inbox, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

type StateProps = {
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  /** Heading level for the title, so the state fits the page outline. */
  headingLevel?: 2 | 3;
};

function State({
  icon: Icon,
  iconClass,
  title,
  description,
  action,
  className,
  headingLevel = 2,
  role,
}: StateProps & { icon: React.ElementType; iconClass: string; role?: "alert" | "status" }) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <div
      role={role}
      className={cn(
        "flex flex-col items-center rounded-lg border border-line bg-surface px-6 py-10 text-center",
        className,
      )}
    >
      <span className={cn("grid size-12 place-items-center rounded-full", iconClass)}>
        <Icon className="size-6" aria-hidden />
      </span>
      <Heading className="mt-4 text-lg font-semibold text-ink">{title}</Heading>
      {description ? (
        <div className="mt-1 max-w-md text-sm text-ink-muted">{description}</div>
      ) : null}
      {action ? <div className="mt-5 flex flex-wrap justify-center gap-2">{action}</div> : null}
    </div>
  );
}

/** Nothing here yet. Invite the next action. */
export function EmptyState(props: StateProps) {
  return <State icon={Inbox} iconClass="bg-surface-sunken text-ink-muted" {...props} />;
}

/** Something failed. Say what went wrong and how to fix it. */
export function ErrorState(props: StateProps) {
  return (
    <State icon={CircleAlert} iconClass="bg-danger-bg text-danger-fg" role="alert" {...props} />
  );
}

/** A task finished. Say what happens next. */
export function SuccessState(props: StateProps) {
  return (
    <State icon={CircleCheck} iconClass="bg-success-bg text-success-fg" role="status" {...props} />
  );
}

/** The signed-in account cannot see this page. Explain who can and how to switch. */
export function PermissionDeniedState(props: StateProps) {
  return <State icon={Lock} iconClass="bg-warning-bg text-warning-fg" {...props} />;
}
