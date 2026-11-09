"use client";

import * as React from "react";
import { ApiError, api, apiPage } from "@/services/api-client";
import { useApiPortal } from "@/features/live/api-portal";
import { CursorPagination, StatusBadge, type StatusTone } from "@/components/ui";

/* Shapes returned by the backend (backend/src/modules/drivers, earnings, support). */
export type DriverProfile = {
  id: string;
  displayName: string;
  email: string;
  city: string | null;
  roles: string[];
  status: string;
};
export type Application = {
  id: string;
  state: "draft" | "submitted" | "under_review" | "approved" | "rejected" | "changes_requested";
  completedStep: number;
  version: number;
  city: string | null;
  experience: "new" | "under_one" | "one_to_three" | "over_three" | null;
  vehicleId: string | null;
  vehicleCategory: "bike" | "auto" | "car" | null;
  screenChoice: string | null;
  agreementTemplateVersion: string | null;
  confirmedReadiness: boolean;
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
};
export type Vehicle = {
  id: string;
  type: "bike" | "auto" | "car";
  model: string;
  year: number;
  verification: "pending" | "under_review" | "approved" | "rejected";
  registrationTokenPresent: boolean;
  createdAt: string;
};
export type Earnings = {
  currency: string;
  earnedPaise: number;
  paidPaise: number;
  reservedPaise: number;
  availablePaise: number;
  entries: { id: string; amountPaise: number; settlementId: string | null; createdAt: string }[];
};
export type Settlement = {
  id: string;
  status: "ready" | "payout_pending" | "paid" | "needs_review";
  periodStart: string;
  periodEnd: string;
  grossPaise: number;
  createdAt: string;
  paidAt: string | null;
};
export type Maintenance = {
  id: string;
  ticketId: string;
  screenId: string;
  state: "open" | "in_progress" | "resolved";
  resolutionNote: string | null;
  openedAt: string;
  updatedAt: string;
  resolvedAt: string | null;
};
export type Notification = {
  id: string;
  kind: string;
  title: string;
  body: string;
  ticketId: string | null;
  createdAt: string;
  readAt: string | null;
};
export type Ticket = {
  id: string;
  subject: string;
  description: string;
  status: string;
  category: string;
  createdAt: string;
};

export function errorMessage(e: unknown) {
  return e instanceof Error ? e.message : "Something went wrong. Try again.";
}

/**
 * Loads one GET resource for the signed-in driver. A 401 ends the session through
 * the portal (back to the sign-in gate), as the generic portal did.
 */
export function useDriverResource<T>(path: string | null, kind: "one" | "list" = "list") {
  const { expire } = useApiPortal();
  const [version, setVersion] = React.useState(0);
  const [page, setPage] = React.useState<{path:string|null;cursor:string|null}>({path:null,cursor:null});
  const cursor = page.path === path ? page.cursor : null;
  const [state, setState] = React.useState<{ key: string; data: T | null; error: string; next:string|null }>({
    key: "",
    data: null,
    error: "", next:null,
  });
  const key = String(path) + "|" + String(cursor) + "|" + version;
  React.useEffect(() => {
    if (!path) return;
    const ac = new AbortController();
    const url = path + (cursor ? (path.includes("?") ? "&" : "?") + "cursor=" + encodeURIComponent(cursor) : "");
    const load =
      kind === "list"
        ? apiPage<unknown>(url, ac.signal).then((r) => ({data:r.data as unknown as T,next:r.meta.nextCursor??null}))
        : api<T>(path, { signal: ac.signal }).then(data=>({data,next:null}));
    load
      .then(({data,next}) => {
        if (!ac.signal.aborted) setState({ key, data, next, error: "" });
      })
      .catch((e) => {
        if (ac.signal.aborted) return;
        if (e instanceof ApiError && e.status === 401) {
          expire("Your session has expired or was revoked.");
          return;
        }
        setState({ key, data: null, next:null, error: errorMessage(e) });
      });
    return () => ac.abort();
  }, [path, kind, key, cursor, expire]);
  const ready = !!path && state.key === key;
  return {
    data: ready ? state.data : null,
    error: ready ? state.error : "",
    loading: !!path && !ready,
    reload: () => setVersion((v) => v + 1),
    next:ready?state.next:null,hasPrevious:!!cursor,
    first:()=>setPage({path,cursor:null}),
    more:()=>{if(ready&&state.next)setPage({path,cursor:state.next});},
  };
}

export function DriverPager({state}:{state:{loading:boolean;next:string|null;hasPrevious:boolean;first:()=>void;more:()=>void}}){
 return <CursorPagination busy={state.loading} hasNext={!!state.next} hasPrevious={state.hasPrevious} onFirst={state.first} onNext={state.more}/>;
}

export const rupees = (paise: number | null | undefined) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format((paise ?? 0) / 100);
export const shortDate = (iso: string | null | undefined) =>
  iso
    ? new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "—";

export const vehicleNames = { bike: "Bike", auto: "Auto rickshaw", car: "Car" } as const;
export const experienceNames = {
  new: "New to driving for work",
  under_one: "Less than a year",
  one_to_three: "One to three years",
  over_three: "More than three years",
} as const;

const statusMap: Record<string, { label: string; tone: StatusTone }> = {
  draft: { label: "In progress", tone: "neutral" },
  submitted: { label: "Submitted", tone: "info" },
  under_review: { label: "Under review", tone: "info" },
  approved: { label: "Approved", tone: "success" },
  rejected: { label: "Not approved", tone: "danger" },
  changes_requested: { label: "Changes needed", tone: "warning" },
  pending: { label: "Not checked yet", tone: "neutral" },
  active: { label: "Active", tone: "success" },
  suspended: { label: "Suspended", tone: "danger" },
  ready: { label: "Ready", tone: "info" },
  payout_pending: { label: "Payout in progress", tone: "info" },
  paid: { label: "Paid", tone: "success" },
  needs_review: { label: "Being checked", tone: "warning" },
  open: { label: "Open", tone: "info" },
  in_progress: { label: "In progress", tone: "info" },
  resolved: { label: "Resolved", tone: "success" },
  closed: { label: "Closed", tone: "neutral" },
};
/** A backend status in plain words with a coloured dot. */
export function DriverStatus({ value }: { value: string | null | undefined }) {
  const v = (value ?? "unknown").toLowerCase();
  const known = statusMap[v];
  return (
    <StatusBadge tone={known?.tone ?? "neutral"}>
      {known?.label ?? v.charAt(0).toUpperCase() + v.slice(1).replaceAll("_", " ")}
    </StatusBadge>
  );
}

/** A titled block of a driver screen. */
export function Block({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="bma-driver-panel rounded-lg border border-line bg-surface p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-heading text-lg font-semibold text-ink">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
