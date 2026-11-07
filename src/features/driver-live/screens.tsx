"use client";

import * as React from "react";
import Link from "next/link";
import { Check, Clock3 } from "lucide-react";
import { api, newIdempotencyKey } from "@/services/api-client";
import { useApiPortal } from "@/features/live/api-portal";
import {
  Alert,
  Button,
  EmptyState,
  Field,
  Input,
  Metric,
  Select,
  SkeletonList,
  Textarea,
  buttonVariants,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import {
  Block,
  DriverStatus,
  errorMessage,
  rupees,
  shortDate,
  useDriverResource,
  DriverPager,
  vehicleNames,
  type Application,
  type DriverProfile,
  type Earnings,
  type Maintenance,
  type Notification,
  type Settlement,
  type Ticket,
  type Vehicle,
} from "./common";

/* ------------------------------------------------------------------ */
/* Today                                                               */
/* ------------------------------------------------------------------ */

const journey = ["Apply", "Verification", "Screen installed", "Ad assignments"] as const;

function journeyStage(app: Application | null): { index: number; note: string } {
  if (!app) return { index: 0, note: "Start your application to become a driver partner." };
  if (app.state === "draft")
    return { index: 0, note: `Application in progress: ${app.completedStep} of 5 steps done.` };
  if (app.state === "submitted" || app.state === "under_review")
    return { index: 1, note: "Your application is with BlinkMyAd for review." };
  if (app.state === "changes_requested")
    return { index: 1, note: "BlinkMyAd asked for changes to your application." };
  if (app.state === "rejected") return { index: 1, note: "Your application wasn't approved." };
  return {
    index: 2,
    note: "Approved. BlinkMyAd will contact you to arrange the screen installation.",
  };
}

/** The driver's status line: the route-line motif from the homepage. */
function JourneyLine({ index }: { index: number }) {
  return (
    <ol className="grid grid-cols-4" aria-label="Your progress">
      {journey.map((label, i) => {
        const done = i < index;
        const current = i === index;
        return (
          <li key={label} className="relative" aria-current={current ? "step" : undefined}>
            {i < journey.length - 1 ? (
              <span
                aria-hidden
                className={cn(
                  "absolute top-[11px] right-0 left-6 h-0.5",
                  done ? "bg-signal" : "bg-line",
                )}
              />
            ) : null}
            <span
              aria-hidden
              className={cn(
                "relative grid size-6 place-items-center rounded-full border-2",
                done && "border-signal bg-signal text-white",
                current && "border-signal bg-surface",
                !done && !current && "border-line bg-surface",
              )}
            >
              {done ? (
                <Check className="size-3.5" />
              ) : current ? (
                <span className="size-2 rounded-full bg-signal" />
              ) : null}
            </span>
            <span
              className={cn(
                "mt-2 block pr-1 text-sm",
                current ? "font-semibold text-ink" : "text-ink-muted",
              )}
            >
              {label}
              {done ? (
                <span className="sr-only"> (done)</span>
              ) : current ? (
                <span className="sr-only"> (current)</span>
              ) : null}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export function DriverToday() {
  const me = useDriverResource<DriverProfile>("/drivers/me", "one");
  const apps = useDriverResource<Application[]>("/drivers/applications");
  const earnings = useDriverResource<Earnings>("/drivers/me/earnings", "one");
  if (me.loading || apps.loading) return <SkeletonList rows={4} label="Loading your day" />;
  const app = apps.data?.[0] ?? null;
  const stage = journeyStage(app);
  const nextAction =
    !app || app.state === "draft"
      ? {
          href: "/driver/onboarding",
          label: app ? "Continue my application" : "Start my application",
        }
      : { href: "/driver/verification", label: "See verification details" };
  return (
    <div className="max-w-3xl space-y-4">
      {me.error || apps.error ? <Alert tone="danger">{me.error || apps.error}</Alert> : null}
      <p className="text-lg text-ink">
        Hello{me.data?.displayName ? `, ${me.data.displayName}` : ""}.
      </p>
      <Block title="Your status">
        <JourneyLine index={stage.index} />
        <p className="mt-4 text-base text-ink">{stage.note}</p>
        <Link
          href={nextAction.href}
          className={cn(buttonVariants({ size: "lg" }), "mt-4 w-full sm:w-auto")}
        >
          {nextAction.label}
        </Link>
      </Block>
      <Block title="Today's assignment">
        <p className="flex items-start gap-2 text-base text-ink-muted">
          <Clock3 className="mt-1 size-4 shrink-0" aria-hidden />
          Ad assignments will appear here once your screen is installed and BlinkMyAd starts assigning
          campaigns. This part of the portal isn&apos;t available yet.
        </p>
      </Block>
      <Block
        title="Earnings"
        action={
          <Link href="/driver/earnings" className={buttonVariants({ variant: "outline" })}>
            See earnings
          </Link>
        }
      >
        {earnings.error ? (
          <Alert tone="danger">{earnings.error}</Alert>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <Metric
              label="Available"
              value={earnings.data ? rupees(earnings.data.availablePaise) : "…"}
            />
            <Metric
              label="Total earned"
              value={earnings.data ? rupees(earnings.data.earnedPaise) : "…"}
            />
          </div>
        )}
      </Block>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Verification                                                        */
/* ------------------------------------------------------------------ */

type Document = { id: string; kind: string; status: string; uploadedAt: string | null };
const documentNames: Record<string, string> = {
  licence: "Driving licence",
  registration: "Vehicle registration (RC)",
  insurance: "Vehicle insurance",
  other: "Other document",
};

function CheckRow({
  done,
  title,
  children,
}: {
  done: boolean | null;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-3 py-3">
      <span
        aria-hidden
        className={cn(
          "mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border-2",
          done ? "border-success-fg bg-success-fg text-white" : "border-line",
        )}
      >
        {done ? <Check className="size-3.5" /> : null}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-ink">
          {title}
          <span className="sr-only">{done ? " (done)" : " (not done)"}</span>
        </p>
        <div className="mt-0.5 text-sm text-ink-muted">{children}</div>
      </div>
    </li>
  );
}

export function DriverVerification() {
  const apps = useDriverResource<Application[]>("/drivers/applications");
  const vehicles = useDriverResource<Vehicle[]>("/drivers/me/vehicles");
  const app = apps.data?.[0] ?? null;
  const docs = useDriverResource<Document[]>(
    app ? "/drivers/applications/" + app.id + "/documents" : null,
  );
  if (apps.loading || vehicles.loading)
    return <SkeletonList rows={4} label="Loading verification" />;
  const vehicle =
    (vehicles.data ?? []).find((v) => v.id === app?.vehicleId) ?? vehicles.data?.[0] ?? null;
  const submitted = !!app && app.state !== "draft";
  return (
    <div className="max-w-2xl space-y-4">
      {apps.error ? <Alert tone="danger">{apps.error}</Alert> : null}
      <Block
        title="Verification checklist"
        action={app ? <DriverStatus value={app.state} /> : undefined}
      >
        <ul className="divide-y divide-line">
          <CheckRow done={!!app && app.completedStep >= 3} title="Application details">
            {app ? `${app.completedStep} of 5 steps complete.` : "Not started."}{" "}
            <Link
              href="/driver/onboarding"
              className="font-semibold text-signal underline underline-offset-4"
            >
              {app ? "Open my application" : "Start my application"}
            </Link>
          </CheckRow>
          <CheckRow done={vehicle?.verification === "approved"} title="Vehicle checked">
            {vehicle ? (
              <span className="inline-flex flex-wrap items-center gap-2">
                {vehicleNames[vehicle.type]}, {vehicle.model}{" "}
                <DriverStatus value={vehicle.verification} />
              </span>
            ) : (
              "No vehicle added yet."
            )}
          </CheckRow>
          <CheckRow
            done={(docs.data ?? []).some((d) => d.status === "verified")}
            title="Identity and vehicle documents"
          >
            {docs.data && docs.data.length ? (
              <ul className="mt-1 space-y-1">
                {docs.data.map((d) => (
                  <li key={d.id} className="flex flex-wrap items-center gap-2">
                    {documentNames[d.kind] ?? d.kind} <DriverStatus value={d.status} />
                  </li>
                ))}
              </ul>
            ) : (
              "Document upload isn't available in the portal yet. BlinkMyAd will tell you how to send your licence, RC and insurance."
            )}
          </CheckRow>
          <CheckRow done={submitted} title="Application submitted">
            {submitted
              ? `Submitted ${shortDate(app?.submittedAt)}.`
              : "Available once the partner agreement is published."}
          </CheckRow>
          <CheckRow done={app?.state === "approved"} title="Approved by BlinkMyAd">
            {app?.state === "approved"
              ? "You're approved."
              : "An BlinkMyAd admin reviews every application."}
          </CheckRow>
        </ul>
      </Block>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Vehicle                                                             */
/* ------------------------------------------------------------------ */

export function DriverVehicles() {
  const { session } = useApiPortal();
  const list = useDriverResource<Vehicle[]>("/drivers/me/vehicles");
  const [type, setType] = React.useState<Vehicle["type"]>("auto");
  const [model, setModel] = React.useState("");
  const [year, setYear] = React.useState("");
  const [touched, setTouched] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const [notice, setNotice] = React.useState("");
  const maxYear = new Date().getFullYear() + 1;
  const yearNumber = Number(year);
  const modelError = touched && !model.trim() ? "Enter the make and model." : undefined;
  const yearError =
    touched && !(Number.isInteger(yearNumber) && yearNumber >= 1990 && yearNumber <= maxYear)
      ? `Enter a year between 1990 and ${maxYear}.`
      : undefined;
  async function add(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (
      !model.trim() ||
      !(Number.isInteger(yearNumber) && yearNumber >= 1990 && yearNumber <= maxYear)
    )
      return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await api("/drivers/me/vehicles", {
        method: "POST",
        csrfToken: session.csrfToken,
        idempotencyKey: newIdempotencyKey(),
        body: { type, model: model.trim(), year: yearNumber },
      });
      setModel("");
      setYear("");
      setTouched(false);
      setNotice("Vehicle added. BlinkMyAd checks it as part of your application.");
      list.reload();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="max-w-2xl space-y-4">
      <Block title="Your vehicles">
        {list.loading ? <SkeletonList rows={2} label="Loading vehicles" /> : null}
        {list.error ? <Alert tone="danger">{list.error}</Alert> : null}
        {list.data && list.data.length === 0 ? (
          <p className="text-base text-ink-muted">
            No vehicles yet. Add the one you&apos;ll carry the screen on.
          </p>
        ) : null}
        <ul className="divide-y divide-line">
          {(list.data ?? []).map((v) => (
            <li key={v.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
              <div>
                <p className="font-medium text-ink">
                  {vehicleNames[v.type]}, {v.model}
                </p>
                <p className="text-sm text-ink-muted tabular-nums">{v.year}</p>
              </div>
              <DriverStatus value={v.verification} />
            </li>
          ))}
        </ul>
        <DriverPager state={list}/>
      </Block>
      <Block title="Add a vehicle">
        <form onSubmit={(e) => void add(e)} noValidate className="space-y-5">
          <fieldset>
            <legend className="text-sm font-semibold text-ink">Vehicle type</legend>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {(Object.keys(vehicleNames) as Vehicle["type"][]).map((t) => (
                <label
                  key={t}
                  className={cn(
                    "flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-lg border px-2 text-sm font-medium has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-signal",
                    type === t ? "border-signal bg-signal-soft text-ink" : "border-line text-ink",
                  )}
                >
                  <input
                    type="radio"
                    name="vehicle-type"
                    className="sr-only"
                    checked={type === t}
                    onChange={() => setType(t)}
                  />
                  {vehicleNames[t]}
                </label>
              ))}
            </div>
          </fieldset>
          <Field
            label="Make and model"
            htmlFor="vehicle-model"
            description="For example: Bajaj RE, Honda Activa, Maruti Dzire."
            error={modelError}
            required
          >
            <Input maxLength={100} value={model} onChange={(e) => setModel(e.target.value)} />
          </Field>
          <Field label="Year" htmlFor="vehicle-year" error={yearError} required>
            <Input
              inputMode="numeric"
              maxLength={4}
              value={year}
              onChange={(e) => setYear(e.target.value.replace(/\D/g, ""))}
            />
          </Field>
          <p className="text-sm text-ink-muted">
            Don&apos;t enter your number plate here. BlinkMyAd checks registration details separately.
          </p>
          {error ? <Alert tone="danger">{error}</Alert> : null}
          {notice ? <Alert tone="success">{notice}</Alert> : null}
          <Button type="submit" size="lg" className="w-full sm:w-auto" loading={busy}>
            Add vehicle
          </Button>
        </form>
      </Block>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Earnings and payouts (read-only)                                    */
/* ------------------------------------------------------------------ */

export function DriverEarnings() {
  const e = useDriverResource<Earnings>("/drivers/me/earnings", "one");
  if (e.loading) return <SkeletonList rows={3} label="Loading earnings" />;
  if (e.error) return <Alert tone="danger">{e.error}</Alert>;
  // Tolerate a partial response rather than crashing the page.
  const d = {
    ...{ earnedPaise: 0, paidPaise: 0, reservedPaise: 0, availablePaise: 0, entries: [] },
    ...(e.data ?? {}),
  } as Earnings;
  const entries = Array.isArray(d.entries) ? d.entries : [];
  return (
    <div className="max-w-3xl space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label="Available" value={rupees(d.availablePaise)} />
        <Metric label="Total earned" value={rupees(d.earnedPaise)} />
        <Metric label="Paid out" value={rupees(d.paidPaise)} />
        <Metric label="In a payout" value={rupees(d.reservedPaise)} />
      </div>
      <p className="text-sm text-ink-muted">
        Amounts are what BlinkMyAd has recorded for you. Available is total earned, minus paid out,
        minus amounts already in a payout.
      </p>
      <Block title="Earning entries">
        {entries.length === 0 ? (
          <p className="text-base text-ink-muted">
            No earnings yet. They appear after delivery evidence is reviewed and earnings are approved.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {entries.map((x) => (
              <li key={x.id} className="flex items-center justify-between gap-3 py-3">
                <span className="text-ink-muted">{shortDate(x.createdAt)}</span>
                <span className="font-medium text-ink tabular-nums">{rupees(x.amountPaise)}</span>
              </li>
            ))}
          </ul>
        )}
      </Block>
    </div>
  );
}

export function DriverPayouts() {
  const s = useDriverResource<Settlement[]>("/drivers/me/settlements");
  if (s.loading) return <SkeletonList rows={3} label="Loading payouts" />;
  return (
    <div className="max-w-3xl space-y-4">
      {s.error ? <Alert tone="danger">{s.error}</Alert> : null}
      <Alert tone="info">
        Payouts are made by BlinkMyAd after each period is checked. Bank payouts aren&apos;t switched
        on yet, so nothing here is sent automatically.
      </Alert>
      <Block title="Payout history">
        {s.data && s.data.length === 0 ? (
          <p className="text-base text-ink-muted">No payouts yet.</p>
        ) : (
          <ul className="divide-y divide-line">
            {(s.data ?? []).map((x) => (
              <li key={x.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div>
                  <p className="font-medium text-ink tabular-nums">{rupees(x.grossPaise)}</p>
                  <p className="text-sm text-ink-muted">
                    {shortDate(x.periodStart)} to {shortDate(x.periodEnd)}
                    {x.paidAt ? `, paid ${shortDate(x.paidAt)}` : ""}
                  </p>
                </div>
                <DriverStatus value={x.status} />
              </li>
            ))}
          </ul>
        )}
        <DriverPager state={s}/>
      </Block>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Maintenance, notifications, support                                 */
/* ------------------------------------------------------------------ */

export function DriverMaintenance() {
  const m = useDriverResource<Maintenance[]>("/maintenance");
  return (
    <div className="max-w-2xl space-y-4">
      <Block
        title="Screen problems"
        action={
          <Link href="/driver/support" className={buttonVariants({ variant: "outline" })}>
            Report a problem
          </Link>
        }
      >
        {m.loading ? <SkeletonList rows={2} label="Loading cases" /> : null}
        {m.error ? <Alert tone="danger">{m.error}</Alert> : null}
        {m.data && m.data.length === 0 ? (
          <p className="text-base text-ink-muted">
            No open cases. If your screen isn&apos;t working, report it from Support with the
            category &ldquo;Screen problem&rdquo;.
          </p>
        ) : null}
        <ul className="divide-y divide-line">
          {(m.data ?? []).map((x) => (
            <li key={x.id} className="py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-ink">Opened {shortDate(x.openedAt)}</p>
                <DriverStatus value={x.state} />
              </div>
              {x.resolutionNote ? (
                <p className="mt-1 text-sm text-ink-muted">{x.resolutionNote}</p>
              ) : null}
            </li>
          ))}
        </ul>
        <DriverPager state={m}/>
      </Block>
    </div>
  );
}

export function DriverNotifications() {
  const { session } = useApiPortal();
  const n = useDriverResource<Notification[]>("/notifications");
  const [busy, setBusy] = React.useState("");
  const [error, setError] = React.useState("");
  async function markRead(id: string) {
    setBusy(id);
    setError("");
    try {
      await api("/notifications/" + id + "/read", {
        method: "POST",
        csrfToken: session.csrfToken,
        body: {},
      });
      n.reload();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy("");
    }
  }
  return (
    <div className="max-w-2xl space-y-4">
      {error ? <Alert tone="danger">{error}</Alert> : null}
      {n.loading ? <SkeletonList rows={3} label="Loading notifications" /> : null}
      {n.error ? <Alert tone="danger">{n.error}</Alert> : null}
      {n.data && n.data.length === 0 ? (
        <EmptyState
          title="No notifications"
          description="Updates about your application, screen and support tickets appear here."
        />
      ) : null}
      <ul className="space-y-3">
        {(n.data ?? []).map((x) => (
          <li
            key={x.id}
            className={cn(
              "rounded-lg border bg-surface p-4",
              x.readAt ? "border-line" : "border-signal",
            )}
          >
            <p className="font-semibold text-ink">
              {!x.readAt ? <span className="sr-only">Unread: </span> : null}
              {x.title}
            </p>
            <p className="mt-1 text-base text-ink-muted">{x.body}</p>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm text-ink-subtle">{shortDate(x.createdAt)}</span>
              {x.readAt ? (
                <span className="text-sm text-ink-muted">Read</span>
              ) : (
                <Button
                  variant="outline"
                  disabled={busy === x.id}
                  onClick={() => void markRead(x.id)}
                >
                  Mark as read
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>
      <DriverPager state={n}/>
    </div>
  );
}

export function DriverSupport() {
  const { session } = useApiPortal();
  const tickets = useDriverResource<Ticket[]>("/support/tickets");
  const [category, setCategory] = React.useState("GENERAL");
  const [screenId, setScreenId] = React.useState("");
  const [subject, setSubject] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [touched, setTouched] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const [notice, setNotice] = React.useState("");
  const [replyTo, setReplyTo] = React.useState<string | null>(null);
  const [reply, setReply] = React.useState("");
  const subjectError =
    touched && subject.trim().length < 5 ? "Write at least 5 characters." : undefined;
  const descriptionError =
    touched && description.trim().length < 12
      ? "Describe the problem in at least 12 characters."
      : undefined;
  const screenError =
    touched && category === "DEVICE" && !/^[0-9a-f-]{36}$/i.test(screenId)
      ? "Enter the screen ID shown on the label of your screen."
      : undefined;
  async function create(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (subject.trim().length < 5 || description.trim().length < 12) return;
    if (category === "DEVICE" && !/^[0-9a-f-]{36}$/i.test(screenId)) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await api("/support/tickets", {
        method: "POST",
        csrfToken: session.csrfToken,
        idempotencyKey: newIdempotencyKey(),
        body: { category, subject, description, ...(category === "DEVICE" ? { screenId } : {}) },
      });
      setSubject("");
      setDescription("");
      setScreenId("");
      setTouched(false);
      setNotice("Sent to support. You'll see replies in your notifications.");
      tickets.reload();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }
  async function respond(id: string) {
    if (!reply.trim()) return;
    setBusy(true);
    setError("");
    try {
      await api("/support/tickets/" + id + "/messages", {
        method: "POST",
        csrfToken: session.csrfToken,
        idempotencyKey: newIdempotencyKey(),
        body: { body: reply, visibility: "PUBLIC" },
      });
      setReply("");
      setReplyTo(null);
      setNotice("Reply sent.");
      tickets.reload();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="max-w-2xl space-y-4">
      <Block title="Contact support">
        <form onSubmit={(e) => void create(e)} noValidate className="space-y-5">
          <Field label="What is it about?" htmlFor="support-category">
            <Select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="GENERAL">General question</option>
              <option value="DEVICE">Screen problem</option>
            </Select>
          </Field>
          {category === "DEVICE" ? (
            <Field
              label="Screen ID"
              htmlFor="support-screen"
              description="Printed on the label of your screen."
              error={screenError}
              required
            >
              <Input value={screenId} onChange={(e) => setScreenId(e.target.value.trim())} />
            </Field>
          ) : null}
          <Field label="Subject" htmlFor="support-subject" error={subjectError} required>
            <Input maxLength={160} value={subject} onChange={(e) => setSubject(e.target.value)} />
          </Field>
          <Field
            label="What happened?"
            htmlFor="support-description"
            error={descriptionError}
            required
          >
            <Textarea
              rows={4}
              maxLength={2000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Field>
          {error ? <Alert tone="danger">{error}</Alert> : null}
          {notice ? <Alert tone="success">{notice}</Alert> : null}
          <Button type="submit" size="lg" className="w-full sm:w-auto" loading={busy && !replyTo}>
            Send to support
          </Button>
        </form>
      </Block>
      <Block title="Your tickets">
        {tickets.loading ? <SkeletonList rows={2} label="Loading tickets" /> : null}
        {tickets.error ? <Alert tone="danger">{tickets.error}</Alert> : null}
        {tickets.data && tickets.data.length === 0 ? (
          <p className="text-base text-ink-muted">No tickets yet.</p>
        ) : null}
        <ul className="divide-y divide-line">
          {(tickets.data ?? []).map((t) => (
            <li key={t.id} className="py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-ink">{t.subject}</p>
                <DriverStatus value={t.status} />
              </div>
              <p className="mt-1 text-sm text-ink-muted">{t.description}</p>
              {replyTo === t.id ? (
                <div className="mt-3 space-y-3">
                  <Field label="Your reply" htmlFor={"reply-" + t.id}>
                    <Textarea
                      rows={3}
                      maxLength={2000}
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                    />
                  </Field>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      loading={busy}
                      disabled={!reply.trim()}
                      onClick={() => void respond(t.id)}
                    >
                      Send reply
                    </Button>
                    <Button variant="ghost" onClick={() => setReplyTo(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="mt-2"
                  onClick={() => {
                    setReplyTo(t.id);
                    setReply("");
                  }}
                >
                  Reply<span className="sr-only"> to {t.subject}</span>
                </Button>
              )}
            </li>
          ))}
        </ul>
        <DriverPager state={tickets}/>
      </Block>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Profile                                                             */
/* ------------------------------------------------------------------ */

export function DriverProfileScreen() {
  const me = useDriverResource<DriverProfile>("/drivers/me", "one");
  if (me.loading) return <SkeletonList rows={3} label="Loading profile" />;
  if (me.error) return <Alert tone="danger">{me.error}</Alert>;
  const p = me.data!;
  return (
    <div className="max-w-2xl space-y-4">
      <Block title="Your details">
        <dl className="divide-y divide-line">
          {[
            ["Name", p.displayName],
            ["Email", p.email],
            ["City", p.city ?? "Not set"],
            ["Account", <DriverStatus key="s" value={p.status} />],
          ].map(([k, v]) => (
            <div key={String(k)} className="grid gap-1 py-3 sm:grid-cols-[8rem_1fr]">
              <dt className="text-ink-muted">{k}</dt>
              <dd className="break-words text-ink">{v}</dd>
            </div>
          ))}
        </dl>
      </Block>
      <p className="text-sm text-ink-muted">
        To change your name or email, contact support. Your vehicles and documents are under{" "}
        <Link
          href="/driver/vehicle"
          className="font-semibold text-signal underline underline-offset-4"
        >
          Vehicle and screen
        </Link>{" "}
        and{" "}
        <Link
          href="/driver/verification"
          className="font-semibold text-signal underline underline-offset-4"
        >
          Verification status
        </Link>
        .
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Not available yet                                                   */
/* ------------------------------------------------------------------ */

const unavailable = {
  "assigned-ads": {
    title: "No ad assignments yet",
    text: "Once your screen is installed, the campaigns assigned to it and their schedule will appear here.",
  },
  campaigns: {
    title: "No campaigns yet",
    text: "Campaigns running on your screen will be listed here once assignments start.",
  },
  delivery: {
    title: "No screen activity yet",
    text: "When your screen is installed and running, a record of what it played will appear here.",
  },
  trips: {
    title: "Trips aren't tracked yet",
    text: "Trip and location tracking needs your consent and isn't switched on. Nothing about your location is recorded.",
  },
} as const;

/** Honest state for driver features that the backend doesn't serve yet (no API call is made). */
export function DriverNotYetAvailable({ kind }: { kind: keyof typeof unavailable }) {
  const u = unavailable[kind];
  return (
    <div className="max-w-2xl">
      <EmptyState
        title={u.title}
        description={<>{u.text} This part of the portal isn&apos;t available yet.</>}
        action={
          <Link href="/driver" className={buttonVariants({ variant: "outline" })}>
            Back to Today
          </Link>
        }
      />
    </div>
  );
}
