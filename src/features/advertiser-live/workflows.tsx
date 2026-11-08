"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, CircleAlert, ImageUp } from "lucide-react";
import { api, newIdempotencyKey } from "@/services/api-client";
import {
  Alert,
  Button,
  EmptyState,
  Field,
  Input,
  Metric,
  Select,
  SkeletonList,
  Tabs,
  buttonVariants,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import {
  useAuth,
  useCollection,
  Panel,
  Notice,
  CollectionNotice,
  Pagination,
  StatusTag,
  message,
  formatDate,
  type Campaign,
  type Creative,
} from "./common";

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const placementNames: Record<string, string> = {
  bike_rear: "Bike-mounted screen",
  auto_rear: "Auto rickshaw rear screen",
  auto_side: "Auto rickshaw side screen",
  car_rear: "Car rear screen",
  car_interior: "Car interior screen",
  helmet: "Helmet wrap",
};
/** Readable placement name; tolerates a missing value instead of crashing the page. */
const placementLabel = (p: string | null | undefined) =>
  p ? (placementNames[p] ?? p.replaceAll("_", " ")) : "Placement not set";

/* ------------------------------------------------------------------ */
/* Dashboard                                                           */
/* ------------------------------------------------------------------ */

export function Dashboard() {
  const { business, businesses } = useAuth();
  const c = useCollection<Campaign>(
    business ? "/campaigns?limit=100&businessId=" + business.id : null,
  );
  const creatives = useCollection<Creative>(
    business ? "/creatives?limit=100&businessId=" + business.id : null,
  );
  const status = (v: string) => c.rows.filter((x) => x.status === v).length;
  const approvedCreatives = creatives.rows.filter((x) => x.approval === "approved").length;
  const loading = c.busy || creatives.busy;

  let next: { title: string; text: string; href: string; label: string } | null = null;
  if (!business)
    next = {
      title: "Add your business",
      text: "Campaigns and creatives belong to a business. Add yours to get started.",
      href: "/advertiser/settings",
      label: "Add a business",
    };
  else if (!loading && creatives.rows.length === 0)
    next = {
      title: "Upload your first creative",
      text: "Every campaign needs an image or video. An admin checks it against the screen specifications.",
      href: "/advertiser/creatives",
      label: "Upload a creative",
    };
  else if (!loading && c.rows.length === 0)
    next = {
      title: "Create your first campaign draft",
      text: "Choose a creative, dates and hours. Drafts are free and nothing is booked until it is approved.",
      href: "/advertiser/create-campaign",
      label: "Create a campaign draft",
    };

  return (
    <div className="space-y-6">
      {next ? (
        <section className="flex flex-col gap-4 rounded-lg border border-signal bg-signal-soft p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-heading text-lg font-semibold text-ink">{next.title}</h2>
            <p className="mt-1 text-base text-ink-muted">{next.text}</p>
          </div>
          <Link href={next.href} className={cn(buttonVariants(), "shrink-0")}>
            {next.label}
          </Link>
        </section>
      ) : null}

      <section aria-labelledby="dash-counts">
        <h2 id="dash-counts" className="sr-only">
          Your records
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Campaigns" value={loading ? "…" : c.rows.length} />
          <Metric label="In review" value={loading ? "…" : status("submitted")} />
          <Metric label="Approved" value={loading ? "…" : status("approved")} />
          <Metric
            label="Approved creatives"
            value={loading ? "…" : `${approvedCreatives} of ${creatives.rows.length}`}
          />
        </div>
        <p className="mt-2 text-sm text-ink-muted">
          Counts of your records in {business?.displayName ?? "this account"}
          {businesses.length > 1 ? ` (one of ${businesses.length} businesses)` : ""}. They are not
          impressions, reach or earnings. Only the first 100 campaigns are counted.
        </p>
      </section>

      <Panel
        title="Recent campaigns"
        action={
          <Link
            className={buttonVariants({ variant: "outline", size: "sm" })}
            href="/advertiser/campaigns"
          >
            See all campaigns
          </Link>
        }
      >
        <CollectionNotice
          busy={c.busy}
          error={c.error || creatives.error}
          length={c.rows.length}
          empty="No campaigns yet."
        />
        {c.rows.length ? <CampaignTable rows={c.rows.slice(0, 6)} /> : null}
      </Panel>
    </div>
  );
}

function CampaignTable({ rows }: { rows: Campaign[] }) {
  return (
    <div role="region" aria-label="Campaigns" tabIndex={0} className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-line text-ink-muted">
          <tr>
            <th scope="col" className="py-2 pr-4 font-semibold">
              Campaign
            </th>
            <th scope="col" className="py-2 pr-4 font-semibold">
              Dates
            </th>
            <th scope="col" className="py-2 pr-4 font-semibold">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((item) => (
            <tr key={item.id} className="border-b border-line last:border-0">
              <td className="py-3 pr-4">
                <Link
                  href={"/advertiser/campaigns/" + item.id}
                  className="font-semibold text-ink underline-offset-4 hover:text-signal hover:underline focus-visible:outline-2 focus-visible:outline-signal"
                >
                  {item.title}
                </Link>
              </td>
              <td className="py-3 pr-4 whitespace-nowrap text-ink-muted tabular-nums">
                {formatDate(item.startDate)} to {formatDate(item.endDate)}
              </td>
              <td className="py-3 pr-4">
                <StatusTag value={item.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Campaign list                                                       */
/* ------------------------------------------------------------------ */

const statusFilters = [
  { value: "", label: "All" },
  { value: "draft", label: "Drafts" },
  { value: "submitted", label: "In review" },
  { value: "changes_requested", label: "Changes requested" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "cancelled", label: "Cancelled" },
];

export function CampaignIndex() {
  const { business } = useAuth();
  const [filter, setFilter] = React.useState("");
  const path = business
    ? "/campaigns?limit=30&businessId=" + business.id + (filter ? "&status=" + filter : "")
    : null;
  const list = useCollection<Campaign>(path);
  return (
    <Panel
      title="Campaigns"
      action={
        <Link className={buttonVariants()} href="/advertiser/create-campaign">
          Create a campaign draft
        </Link>
      }
    >
      <Tabs
        label="Filter campaigns by status"
        tabs={statusFilters}
        value={filter}
        onValueChange={setFilter}
      />
      <CollectionNotice
        busy={list.busy}
        error={list.error}
        length={list.rows.length}
        empty={
          filter
            ? "No campaigns with this status."
            : "No campaigns yet. Create a draft to get started."
        }
      />
      {list.rows.length ? <CampaignTable rows={list.rows} /> : null}
      <Pagination hasPrevious={list.hasPrevious} busy={list.busy} next={list.next} more={list.more} first={list.first} />
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/* Stepped campaign flow (create and edit share it)                    */
/* ------------------------------------------------------------------ */

type Draft = {
  title: string;
  creativeId: string;
  startDate: string;
  endDate: string;
  weekdays: number[];
  fromTime: string;
  toTime: string;
};

const validDates = (start: string, end: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end) || start > end)
    return false;
  const d = (Date.parse(end + "T00:00:00Z") - Date.parse(start + "T00:00:00Z")) / 86400000;
  return Number.isFinite(d) && d >= 0 && d < 60;
};
const dayCount = (start: string, end: string) =>
  Math.round((Date.parse(end + "T00:00:00Z") - Date.parse(start + "T00:00:00Z")) / 86400000) + 1;

function detailsErrors(d: Draft) {
  const e: Partial<Record<"title" | "creativeId", string>> = {};
  if (!d.title.trim()) e.title = "Enter a campaign name.";
  if (!d.creativeId) e.creativeId = "Choose the creative this campaign will show.";
  return e;
}
function scheduleErrors(d: Draft) {
  const e: Partial<Record<"startDate" | "endDate" | "weekdays" | "time", string>> = {};
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d.startDate))
    e.startDate = "Choose the first day of the campaign.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d.endDate)) e.endDate = "Choose the last day of the campaign.";
  else if (d.startDate && d.endDate < d.startDate)
    e.endDate = "The last day must be on or after the first day.";
  else if (d.startDate && !validDates(d.startDate, d.endDate))
    e.endDate = "A campaign can run for up to 60 days. Choose an earlier last day.";
  if (!d.weekdays.length) e.weekdays = "Choose at least one day of the week.";
  if (!d.fromTime || !d.toTime || d.toTime <= d.fromTime)
    e.time = "The daily end time must be later than the start time.";
  return e;
}

const steps = [
  { id: "details", label: "Name and creative" },
  { id: "schedule", label: "Schedule" },
  { id: "review", label: "Review" },
] as const;
type StepId = (typeof steps)[number]["id"];

/** Step progress rail: the route-line motif. Completed steps can be revisited. */
function StepRail({
  current,
  reachable,
  onSelect,
}: {
  current: number;
  reachable: number;
  onSelect: (i: number) => void;
}) {
  return (
    <nav aria-label="Campaign steps">
      <ol className="flex">
        {steps.map((step, i) => {
          const done = i < current;
          const active = i === current;
          const canGo = i <= reachable && !active;
          return (
            <li key={step.id} className="relative flex-1">
              {i < steps.length - 1 ? (
                <span
                  aria-hidden
                  className={cn(
                    "absolute top-[15px] right-0 left-8 h-0.5",
                    i < current ? "bg-signal" : "bg-line",
                  )}
                />
              ) : null}
              <button
                type="button"
                disabled={!canGo}
                onClick={() => onSelect(i)}
                aria-current={active ? "step" : undefined}
                className="relative flex min-h-11 flex-col items-start gap-1.5 rounded-md pr-2 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal disabled:cursor-default"
              >
                <span
                  className={cn(
                    "grid size-8 place-items-center rounded-full border-2 text-sm font-semibold tabular-nums",
                    active && "border-signal bg-signal text-white",
                    done && "border-signal bg-surface text-signal",
                    !active && !done && "border-line bg-surface text-ink-muted",
                  )}
                >
                  {done ? <Check className="size-4" aria-hidden /> : i + 1}
                </span>
                <span
                  className={cn("text-sm", active ? "font-semibold text-ink" : "text-ink-muted")}
                >
                  <span className="sr-only">Step {i + 1}: </span>
                  {step.label}
                  {done ? <span className="sr-only"> (complete)</span> : null}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function WeekdayPicker({
  selected,
  onChange,
  error,
}: {
  selected: number[];
  onChange: (n: number[]) => void;
  error?: string;
}) {
  return (
    <fieldset aria-describedby={error ? "weekdays-error" : undefined}>
      <legend className="text-sm font-semibold text-ink">Days of the week</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {dayNames.map((day, index) => {
          const on = selected.includes(index);
          return (
            <label
              key={day}
              className={cn(
                "flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border px-3 text-sm has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-signal",
                on ? "border-signal bg-signal-soft text-ink" : "border-line-strong text-ink",
              )}
            >
              <input
                type="checkbox"
                checked={on}
                className="size-4 accent-signal"
                onChange={(e) =>
                  onChange(
                    e.target.checked
                      ? [...selected, index].sort()
                      : selected.filter((x) => x !== index),
                  )
                }
              />
              <span aria-hidden>{day.slice(0, 3)}</span>
              <span className="sr-only">{day}</span>
            </label>
          );
        })}
      </div>
      {error ? (
        <p
          id="weekdays-error"
          className="mt-1.5 flex items-start gap-1.5 text-sm font-medium text-danger-fg"
        >
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

function CreativePicker({
  creatives,
  value,
  onChange,
  error,
}: {
  creatives: Creative[];
  value: string;
  onChange: (id: string) => void;
  error?: string;
}) {
  return (
    <fieldset aria-describedby={error ? "creative-error" : undefined}>
      <legend className="text-sm font-semibold text-ink">Creative</legend>
      <p className="mt-1 text-sm text-ink-muted">
        You can save a draft with any creative, but you can only submit it once its creative is
        approved.
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {creatives.map((c) => (
          <label
            key={c.id}
            className={cn(
              "flex min-h-16 cursor-pointer items-start gap-3 rounded-lg border p-3 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-signal",
              value === c.id ? "border-signal bg-signal-soft" : "border-line hover:bg-paper",
            )}
          >
            <input
              type="radio"
              name="creative"
              value={c.id}
              checked={value === c.id}
              onChange={() => onChange(c.id)}
              className="mt-1 size-4 accent-signal"
            />
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-ink">{c.title}</span>
              <span className="block text-sm text-ink-muted">{placementLabel(c.placement)}</span>
            </span>
            <StatusTag value={c.approval} />
          </label>
        ))}
      </div>
      {error ? (
        <p
          id="creative-error"
          className="mt-1.5 flex items-start gap-1.5 text-sm font-medium text-danger-fg"
        >
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

function CampaignFlow({
  draft,
  setDraft,
  creatives,
  creativesBusy,
  creativesError,
  initialStep = "details",
  reviewActions,
  reviewNote,
}: {
  draft: Draft;
  setDraft: React.Dispatch<React.SetStateAction<Draft>>;
  creatives: Creative[];
  creativesBusy: boolean;
  creativesError: string;
  initialStep?: StepId;
  reviewActions: React.ReactNode;
  reviewNote?: React.ReactNode;
}) {
  const startIndex = steps.findIndex((s) => s.id === initialStep);
  const [step, setStep] = React.useState(startIndex);
  const [reachable, setReachable] = React.useState(startIndex);
  const [attempted, setAttempted] = React.useState<Record<string, boolean>>({});
  const headingRef = React.useRef<HTMLHeadingElement>(null);
  const firstRender = React.useRef(true);
  React.useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));
  const dErr = attempted.details ? detailsErrors(draft) : {};
  const sErr = attempted.schedule ? scheduleErrors(draft) : {};
  const chosen = creatives.find((c) => c.id === draft.creativeId);

  function go(to: number) {
    setStep(to);
    setReachable((r) => Math.max(r, to));
  }
  function next() {
    const id = steps[step]!.id;
    const errors =
      id === "details" ? detailsErrors(draft) : id === "schedule" ? scheduleErrors(draft) : {};
    setAttempted((a) => ({ ...a, [id]: true }));
    if (Object.keys(errors).length) return;
    go(step + 1);
  }

  return (
    <div className="space-y-6">
      <StepRail current={step} reachable={reachable} onSelect={go} />
      <section
        aria-labelledby="flow-step"
        className="rounded-lg border border-line bg-surface p-5 sm:p-6"
      >
        <h2
          ref={headingRef}
          id="flow-step"
          tabIndex={-1}
          className="font-heading text-xl font-semibold text-ink focus:outline-none"
        >
          {steps[step]!.label}
        </h2>

        {steps[step]!.id === "details" ? (
          <div className="mt-5 grid max-w-3xl gap-6">
            <Field
              label="Campaign name"
              htmlFor="campaign-title"
              description="Only you and BlinkMyAd admins see this name."
              error={dErr.title}
              required
            >
              <Input
                maxLength={180}
                value={draft.title}
                onChange={(e) => set("title", e.target.value)}
              />
            </Field>
            {creativesError ? <Notice kind="error">{creativesError}</Notice> : null}
            {creativesBusy ? (
              <SkeletonList rows={2} label="Loading your creatives" />
            ) : creatives.length === 0 ? (
              <EmptyState
                headingLevel={3}
                title="Upload a creative first"
                description="A campaign needs an image or video to show. Upload one in the creative library, then come back."
                action={
                  <Link href="/advertiser/creatives" className={buttonVariants()}>
                    Go to the creative library
                  </Link>
                }
              />
            ) : (
              <CreativePicker
                creatives={creatives}
                value={draft.creativeId}
                onChange={(id) => set("creativeId", id)}
                error={dErr.creativeId}
              />
            )}
          </div>
        ) : null}

        {steps[step]!.id === "schedule" ? (
          <div className="mt-5 grid max-w-3xl gap-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="First day" htmlFor="campaign-start" error={sErr.startDate} required>
                <Input
                  type="date"
                  value={draft.startDate}
                  onChange={(e) => set("startDate", e.target.value)}
                />
              </Field>
              <Field
                label="Last day"
                htmlFor="campaign-end"
                description="Up to 60 days after the first day."
                error={sErr.endDate}
                required
              >
                <Input
                  type="date"
                  value={draft.endDate}
                  onChange={(e) => set("endDate", e.target.value)}
                />
              </Field>
              <Field label="Daily start time" htmlFor="campaign-from" required>
                <Input
                  type="time"
                  value={draft.fromTime}
                  onChange={(e) => set("fromTime", e.target.value)}
                />
              </Field>
              <Field label="Daily end time" htmlFor="campaign-to" error={sErr.time} required>
                <Input
                  type="time"
                  value={draft.toTime}
                  onChange={(e) => set("toTime", e.target.value)}
                />
              </Field>
            </div>
            <WeekdayPicker
              selected={draft.weekdays}
              onChange={(w) => set("weekdays", w)}
              error={sErr.weekdays}
            />
          </div>
        ) : null}

        {steps[step]!.id === "review" ? (
          <div className="mt-5 max-w-3xl space-y-5">
            <dl className="divide-y divide-line border-y border-line text-base">
              {[
                ["Campaign name", draft.title.trim() || "—", 0],
                [
                  "Creative",
                  chosen ? (
                    <span className="inline-flex flex-wrap items-center gap-2">
                      {chosen.title} <StatusTag value={chosen.approval} />
                    </span>
                  ) : (
                    "—"
                  ),
                  0,
                ],
                [
                  "Dates",
                  validDates(draft.startDate, draft.endDate)
                    ? `${formatDate(draft.startDate)} to ${formatDate(draft.endDate)} (${dayCount(draft.startDate, draft.endDate)} days)`
                    : "—",
                  1,
                ],
                ["Daily hours", `${draft.fromTime} to ${draft.toTime}`, 1],
                [
                  "Days",
                  draft.weekdays.length === 7
                    ? "Every day"
                    : draft.weekdays.map((n) => dayNames[n]!.slice(0, 3)).join(", "),
                  1,
                ],
              ].map(([k, v, stepIndex]) => (
                <div
                  key={String(k)}
                  className="grid gap-1 py-3 sm:grid-cols-[10rem_1fr_auto] sm:items-center"
                >
                  <dt className="text-ink-muted">{k}</dt>
                  <dd className="text-ink">{v}</dd>
                  <dd>
                    <Button variant="link" onClick={() => go(Number(stepIndex))}>
                      Change<span className="sr-only"> {String(k).toLowerCase()}</span>
                    </Button>
                  </dd>
                </div>
              ))}
            </dl>
            {chosen && chosen.approval !== "approved" ? (
              <Alert tone="warning" title="This creative isn't approved yet">
                You can save the draft now. You can submit it for review once the creative is
                approved.
              </Alert>
            ) : null}
            {reviewNote}
          </div>
        ) : null}

        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
          {step > 0 ? (
            <Button variant="outline" onClick={() => go(step - 1)}>
              Back to {steps[step - 1]!.label.toLowerCase()}
            </Button>
          ) : (
            <span />
          )}
          {steps[step]!.id === "review" ? (
            <div className="flex flex-col gap-3 sm:flex-row">{reviewActions}</div>
          ) : (
            <Button onClick={next} disabled={steps[step]!.id === "details" && !creatives.length}>
              Continue to {steps[step + 1]!.label.toLowerCase()}
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}

export function CampaignEditor() {
  const router = useRouter(),
    { business, session } = useAuth();
  const creatives = useCollection<Creative>(
    business ? "/creatives?limit=100&businessId=" + business.id : null,
  );
  const [draft, setDraft] = React.useState<Draft>({
    title: "",
    creativeId: "",
    startDate: "",
    endDate: "",
    weekdays: [0, 1, 2, 3, 4, 5, 6],
    fromTime: "09:00",
    toTime: "21:00",
  });
  const [busy, setBusy] = React.useState(false),
    [error, setError] = React.useState("");

  async function submit() {
    if (!business || busy) return;
    const { title, creativeId, startDate: start, endDate: end, weekdays, fromTime, toTime } = draft;
    if (!validDates(start, end) || !weekdays.length || toTime <= fromTime) {
      setError("Choose a valid 1–60 day schedule and a valid time window.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const created = await api<Campaign>("/campaigns", {
        method: "POST",
        csrfToken: session.csrfToken,
        idempotencyKey: newIdempotencyKey(),
        body: {
          businessId: business.id,
          creativeId,
          title: title.trim(),
          startDate: start,
          endDate: end,
          weekdays,
          timeWindow: { start: fromTime, end: toTime },
        },
      });
      router.push("/advertiser/campaigns/" + created.id);
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  }
  if (!business)
    return (
      <Notice kind="warning">
        Add a business in Profile and settings before creating campaigns.
      </Notice>
    );
  return (
    <CampaignFlow
      draft={draft}
      setDraft={setDraft}
      creatives={creatives.rows}
      creativesBusy={creatives.busy}
      creativesError={creatives.error}
      reviewNote={
        <>
          <p className="text-sm text-ink-muted">
            Saving creates a draft. Nothing is booked or charged, and you can come back to edit it
            from Campaigns. When it&apos;s ready, submit it for review from the draft.
          </p>
          {error ? <Notice kind="error">{error}</Notice> : null}
        </>
      }
      reviewActions={
        <Button onClick={() => void submit()} loading={busy}>
          Save campaign draft
        </Button>
      }
    />
  );
}

const toDraft = (c: Campaign): Draft => ({
  title: c.title,
  creativeId: c.creativeId,
  startDate: c.startDate,
  endDate: c.endDate,
  weekdays: c.weekdays,
  fromTime: c.timeWindow.start,
  toTime: c.timeWindow.end,
});

export function CampaignDetail({ id }: { id: string }) {
  const { session } = useAuth();
  const [row, setRow] = React.useState<Campaign | null>(null);
  const creatives = useCollection<Creative>(
    row ? "/creatives?limit=100&businessId=" + row.ownerBusinessId : null,
  );
  const [draft, setDraft] = React.useState<Draft>({
    title: "",
    creativeId: "",
    startDate: "",
    endDate: "",
    weekdays: [],
    fromTime: "",
    toTime: "",
  });
  const [loading, setLoading] = React.useState(true),
    [error, setError] = React.useState("");
  const [notice, setNotice] = React.useState(""),
    [busy, setBusy] = React.useState(false),
    [revision, setRevision] = React.useState(0);
  React.useEffect(() => {
    let live = true;
    void api<Campaign>("/campaigns/" + id)
      .then((c) => {
        if (live) {
          setRow(c);
          setDraft(toDraft(c));
        }
      })
      .catch((e) => {
        if (live) setError(message(e));
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [id, revision]);
  const { title, creativeId, startDate, endDate, weekdays, fromTime, toTime } = draft;
  const dirty =
    !!row &&
    (title.trim() !== row.title ||
      creativeId !== row.creativeId ||
      startDate !== row.startDate ||
      endDate !== row.endDate ||
      fromTime !== row.timeWindow.start ||
      toTime !== row.timeWindow.end ||
      weekdays.join(",") !== row.weekdays.join(","));
  async function update() {
    if (!row || busy || !dirty) return;
    if (
      !title.trim() ||
      !creativeId ||
      !weekdays.length ||
      !validDates(startDate, endDate) ||
      toTime <= fromTime
    ) {
      setError("Enter a valid title, creative and 1–60 day delivery schedule.");
      return;
    }
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await api("/campaigns/" + row.id, {
        method: "PATCH",
        csrfToken: session.csrfToken,
        body: {
          expectedRevision: row.revision,
          title: title.trim(),
          creativeId,
          startDate,
          endDate,
          weekdays,
          timeWindow: { start: fromTime, end: toTime },
        },
      });
      setNotice("Draft saved.");
      setRevision((v) => v + 1);
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  }
  async function submit() {
    if (!row || busy || dirty) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await api("/campaigns/" + row.id + "/submit", {
        method: "POST",
        body: {},
        csrfToken: session.csrfToken,
        idempotencyKey: newIdempotencyKey(),
      });
      setNotice(
        "Submitted for review. An BlinkMyAd admin will check it before anything is scheduled.",
      );
      setRevision((v) => v + 1);
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  }
  if (loading) return <SkeletonList rows={4} label="Loading campaign" />;
  if (!row) return <Notice kind="error">{error || "This campaign couldn't be loaded."}</Notice>;
  const editable = ["draft", "changes_requested"].includes(row.status);
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <StatusTag value={row.status} />
          <span className="text-sm text-ink-muted tabular-nums">Revision {row.revision}</span>
        </div>
        <Link
          className={buttonVariants({ variant: "outline", size: "sm" })}
          href="/advertiser/campaigns"
        >
          Back to campaigns
        </Link>
      </div>
      {row.reviewReason ? (
        <Alert tone="warning" title="Feedback from the reviewer">
          {row.reviewReason}
        </Alert>
      ) : null}
      {notice ? <Notice kind="success">{notice}</Notice> : null}
      {editable ? (
        <CampaignFlow
          draft={draft}
          setDraft={setDraft}
          creatives={creatives.rows}
          creativesBusy={creatives.busy}
          creativesError={creatives.error}
          initialStep="review"
          reviewNote={
            <>
              <p className="text-sm text-ink-muted">
                {dirty
                  ? "You have unsaved changes. Save them before submitting."
                  : "Submitting sends the campaign to an BlinkMyAd admin. You can't edit it while it is in review."}
              </p>
              {error ? <Notice kind="error">{error}</Notice> : null}
            </>
          }
          reviewActions={
            <>
              {dirty ? (
                <Button variant="outline" disabled={busy} onClick={() => void update()}>
                  Save draft changes
                </Button>
              ) : null}
              <Button
                disabled={busy || dirty}
                loading={busy && !dirty}
                onClick={() => void submit()}
              >
                Submit for review
              </Button>
            </>
          }
        />
      ) : (
        <Panel title={row.title}>
          {error ? <Notice kind="error">{error}</Notice> : null}
          <dl className="divide-y divide-line border-y border-line">
            {[
              ["Dates", `${formatDate(row.startDate)} to ${formatDate(row.endDate)}`],
              ["Daily hours", `${row.timeWindow.start} to ${row.timeWindow.end}`],
              ["Days", row.weekdays.map((n) => dayNames[n]!.slice(0, 3)).join(", ")],
            ].map(([k, v]) => (
              <div key={k} className="grid gap-1 py-3 sm:grid-cols-[10rem_1fr]">
                <dt className="text-ink-muted">{k}</dt>
                <dd className="text-ink tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>
        </Panel>
      )}
      <p className="text-sm text-ink-muted">
        Pricing and screen selection happen separately, in{" "}
        <Link
          href="/advertiser/billing"
          className="font-semibold text-signal underline underline-offset-4"
        >
          Billing and payments
        </Link>
        . A campaign record is not proof of delivery or payment.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Creative library                                                    */
/* ------------------------------------------------------------------ */

type Asset = { id: string; state: string; mimeType: string; failureCode: string | null };
type UploadIntent = {
  assetId: string;
  uploadUrl: string;
  requiredHeaders: Record<string, string>;
  expiresAt: string;
};
const options = [
  "bike_rear",
  "auto_rear",
  "auto_side",
  "car_rear",
  "car_interior",
  "helmet",
] as const;

export function CreativeLibrary() {
  const { business, session } = useAuth();
  const list = useCollection<Creative>(
    business ? "/creatives?limit=100&businessId=" + business.id : null,
  );
  const [file, setFile] = React.useState<File | null>(null),
    [asset, setAsset] = React.useState<Asset | null>(null);
  const [name, setName] = React.useState(""),
    [placement, setPlacement] = React.useState<string>(options[0]);
  const [busy, setBusy] = React.useState(false),
    [error, setError] = React.useState(""),
    [notice, setNotice] = React.useState("");

  async function upload() {
    if (!business || !file || busy) return;
    setError("");
    setNotice("");
    setBusy(true);
    try {
      if (
        !["image/png", "image/jpeg", "video/mp4"].includes(file.type) ||
        file.size < 16 ||
        file.size > 104857600
      )
        throw new Error("Use a PNG, JPEG or MP4 file up to 100 MB.");
      const buffer = await file.arrayBuffer();
      const hash = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", buffer)))
        .map((x) => x.toString(16).padStart(2, "0"))
        .join("");
      const intent = await api<UploadIntent>("/creatives/upload-intents", {
        method: "POST",
        csrfToken: session.csrfToken,
        idempotencyKey: newIdempotencyKey(),
        body: {
          businessId: business.id,
          contentType: file.type,
          sizeBytes: file.size,
          sha256: hash,
        },
      });
      const url = new URL(intent.uploadUrl);
      if (url.protocol !== "https:" || url.username || url.password || !url.hostname)
        throw new Error("Storage service returned an unsafe upload address.");
      // Keep this call compact: tests/b3-advertiser-live-contract.test.mjs checks these exact options.
      // prettier-ignore
      const result=await fetch(intent.uploadUrl,{method:"PUT",headers:intent.requiredHeaders,body:buffer,redirect:"error",credentials:"omit"});
      if (!result.ok)
        throw new Error("The upload didn't finish (" + result.status + "). Try again.");
      const completed = await api<Asset>("/creatives/assets/" + intent.assetId + "/complete", {
        method: "POST",
        csrfToken: session.csrfToken,
        body: {},
      });
      setAsset(completed);
      setNotice(
        "Uploaded. The file is now being checked and processed; check its status in a moment.",
      );
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  }
  async function checkAsset() {
    if (!asset || busy) return;
    setBusy(true);
    setError("");
    try {
      setAsset(await api<Asset>("/creatives/assets/" + asset.id));
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  }
  async function register() {
    if (!business || !asset || asset.state !== "ready" || !name.trim() || busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      // prettier-ignore
      await api("/creatives",{method:"POST",csrfToken:session.csrfToken,idempotencyKey:newIdempotencyKey(),body:{businessId:business.id,title:name.trim(),placement,mediaAssetId:asset.id}});
      setAsset(null);
      setFile(null);
      setName("");
      setNotice("Creative sent for review. You'll see its status in the list below.");
      list.refresh();
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  }
  const stage = !asset ? 1 : asset.state !== "ready" ? 2 : 3;
  return (
    <div className="space-y-6">
      <Panel
        title="Add a creative"
        description="Upload the file, wait for it to be checked, then send it for review. Being sent for review is not approval."
      >
        {!business ? (
          <Notice kind="warning">
            Add a business in Profile and settings before uploading creatives.
          </Notice>
        ) : (
          <>
            <ol className="grid gap-2 text-sm sm:grid-cols-3">
              {["Upload the file", "File checked and processed", "Send for review"].map(
                (label, i) => (
                  <li
                    key={label}
                    aria-current={stage === i + 1 ? "step" : undefined}
                    className={cn(
                      "flex items-center gap-2 rounded-md border px-3 py-2",
                      stage === i + 1
                        ? "border-signal bg-signal-soft font-semibold text-ink"
                        : "border-line text-ink-muted",
                    )}
                  >
                    <span className="tabular-nums">{i + 1}.</span> {label}
                  </li>
                ),
              )}
            </ol>
            <div className="grid max-w-3xl gap-5 sm:grid-cols-2">
              <Field
                label="File"
                htmlFor="creative-file"
                description="PNG, JPEG or MP4, up to 100 MB."
                className="sm:col-span-2"
              >
                <Input
                  type="file"
                  accept="image/png,image/jpeg,video/mp4"
                  className="py-2"
                  onChange={(e) => {
                    setFile(e.target.files?.[0] ?? null);
                    setAsset(null);
                  }}
                />
              </Field>
              <Field label="Creative name" htmlFor="creative-name" required>
                <Input maxLength={180} value={name} onChange={(e) => setName(e.target.value)} />
              </Field>
              <Field label="Placement" htmlFor="creative-placement">
                <Select value={placement} onChange={(e) => setPlacement(e.target.value)}>
                  {options.map((x) => (
                    <option key={x} value={x}>
                      {placementLabel(x)}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                disabled={busy || !file || !!asset}
                loading={busy && !asset}
                onClick={() => void upload()}
              >
                <ImageUp className="size-4" aria-hidden />
                Upload file
              </Button>
              {asset ? (
                <Button variant="outline" disabled={busy} onClick={() => void checkAsset()}>
                  Check processing status
                </Button>
              ) : null}
              {asset?.state === "ready" ? (
                <Button disabled={busy || !name.trim()} onClick={() => void register()}>
                  Send for review
                </Button>
              ) : null}
              {asset ? (
                <span className="flex items-center gap-2 text-sm text-ink-muted">
                  File status: <StatusTag value={asset.state} />
                  {asset.failureCode ? <span>({asset.failureCode})</span> : null}
                </span>
              ) : null}
            </div>
            {error ? <Notice kind="error">{error}</Notice> : null}
            {notice ? <Notice kind="success">{notice}</Notice> : null}
          </>
        )}
      </Panel>
      <Panel
        title="Your creatives"
        action={
          <Button variant="outline" size="sm" onClick={list.refresh}>
            Refresh list
          </Button>
        }
      >
        <CollectionNotice
          busy={list.busy}
          error={list.error}
          length={list.rows.length}
          empty="No creatives yet. Upload your first one above."
        />
        {list.rows.length ? (
          <ul className="divide-y divide-line">
            {list.rows.map((c) => (
              <li key={c.id} className="flex flex-wrap items-start justify-between gap-3 py-3">
                <div>
                  <p className="font-semibold text-ink">{c.title}</p>
                  <p className="text-sm text-ink-muted">
                    {placementLabel(c.placement)}, added {formatDate(c.createdAt)}
                  </p>
                  {c.reviewReason ? (
                    <p className="mt-1 text-sm text-warning-fg">
                      Reviewer feedback: {c.reviewReason}
                    </p>
                  ) : null}
                </div>
                <StatusTag value={c.approval} />
              </li>
            ))}
          </ul>
        ) : null}
      </Panel>
    </div>
  );
}
