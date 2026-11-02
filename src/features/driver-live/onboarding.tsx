"use client";

import * as React from "react";
import Link from "next/link";
import { Check, Lock } from "lucide-react";
import { ApiError, api, newIdempotencyKey } from "@/services/api-client";
import { useApiPortal } from "@/features/live/api-portal";
import { Alert, Button, Field, Input, SkeletonList, buttonVariants } from "@/components/ui";
import { cn } from "@/lib/utils";
import {
  Block,
  DriverStatus,
  errorMessage,
  experienceNames,
  shortDate,
  useDriverResource,
  vehicleNames,
  type Application,
  type Vehicle,
} from "./common";

const stepTitles = [
  "Your city and experience",
  "Your vehicle",
  "Screen placement",
  "Partner agreement",
  "Final check and submit",
];

// Screen placements a driver can choose for each vehicle type (stored as the step 3 choice).
const screenOptions: Record<Vehicle["type"], string[]> = {
  bike: ["Bike rear screen"],
  auto: ["Auto rickshaw rear screen", "Auto rickshaw side screen"],
  car: ["Car interior screen", "Car rear screen"],
};

function Choice({
  name,
  value,
  checked,
  onChange,
  label,
  hint,
}: {
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  label: string;
  hint?: React.ReactNode;
}) {
  return (
    <label
      className={cn(
        "flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-signal",
        checked ? "border-signal bg-signal-soft" : "border-line hover:bg-paper",
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="size-5 shrink-0 accent-signal"
      />
      <span className="min-w-0 flex-1">
        <span className="block text-base font-medium text-ink">{label}</span>
        {hint ? <span className="block text-sm text-ink-muted">{hint}</span> : null}
      </span>
    </label>
  );
}

/**
 * Driver application on the live API: start, steps 1–3, and an honest locked state for
 * the partner agreement (step 4), final check (step 5) and submission until AdVibe
 * publishes the agreement.
 */
export function DriverOnboarding() {
  const { session } = useApiPortal();
  const apps = useDriverResource<Application[]>("/drivers/applications");
  const vehicles = useDriverResource<Vehicle[]>("/drivers/me/vehicles");
  const [saved, setSaved] = React.useState<Application | null>(null);
  const [editing, setEditing] = React.useState<number | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const [notice, setNotice] = React.useState("");

  const fromServer = apps.data?.[0] ?? null;
  const app =
    saved && fromServer && saved.id === fromServer.id && saved.version >= fromServer.version
      ? saved
      : saved && !fromServer
        ? saved
        : fromServer;

  // Step form state, seeded from the application.
  const [city, setCity] = React.useState("");
  const [experience, setExperience] = React.useState<Application["experience"]>(null);
  const [vehicleId, setVehicleId] = React.useState("");
  const [screenChoice, setScreenChoice] = React.useState("");
  const [touched, setTouched] = React.useState(false);
  const seededFor = React.useRef("");
  React.useEffect(() => {
    if (!app || seededFor.current === app.id + ":" + app.version) return;
    seededFor.current = app.id + ":" + app.version;
    const frame = window.requestAnimationFrame(() => {
      setCity(app.city ?? "");
      setExperience(app.experience);
      setVehicleId(app.vehicleId ?? "");
      setScreenChoice(app.screenChoice ?? "");
    });
    return () => window.cancelAnimationFrame(frame);
  }, [app]);

  async function start() {
    setBusy(true);
    setError("");
    try {
      const created = await api<Application>("/drivers/applications", {
        method: "POST",
        csrfToken: session.csrfToken,
        idempotencyKey: newIdempotencyKey(),
        body: {},
      });
      setSaved(created);
      apps.reload();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  async function saveStep(step: 1 | 2 | 3) {
    if (!app) return;
    setTouched(true);
    const usable = (vehicles.data ?? []).filter((v) => v.verification !== "rejected");
    const vehicle = usable.find((v) => v.id === vehicleId);
    let body: Record<string, unknown>;
    if (step === 1) {
      if (city.trim().length < 2 || !experience) return;
      body = { step: 1, expectedVersion: app.version, city: city.trim(), experience };
    } else if (step === 2) {
      if (!vehicle) return;
      body = {
        step: 2,
        expectedVersion: app.version,
        vehicleId: vehicle.id,
        vehicleCategory: vehicle.type,
      };
    } else {
      if (!screenChoice) return;
      body = { step: 3, expectedVersion: app.version, screenChoice };
    }
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const updated = await api<Application>("/drivers/applications/" + app.id, {
        method: "PATCH",
        csrfToken: session.csrfToken,
        body,
      });
      setSaved(updated);
      setEditing(null);
      setTouched(false);
      setNotice(stepTitles[step - 1] + " saved.");
    } catch (e) {
      if (e instanceof ApiError && e.code === "VERSION_CONFLICT") {
        setError(
          "Your application changed somewhere else. We've reloaded it; check it and save again.",
        );
        setSaved(null);
        apps.reload();
      } else setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  if (apps.loading || vehicles.loading)
    return <SkeletonList rows={4} label="Loading your application" />;
  if (apps.error) return <Alert tone="danger">{apps.error}</Alert>;

  if (!app) {
    return (
      <div className="max-w-2xl space-y-4">
        <Block title="Apply to become a driver partner">
          <p className="text-base text-ink-muted">
            The application has five short steps: your city and experience, your vehicle, where the
            screen goes, the partner agreement and a final check. Your progress is saved after each
            step, so you can stop and come back.
          </p>
          {error ? (
            <Alert tone="danger" className="mt-4">
              {error}
            </Alert>
          ) : null}
          <Button
            size="lg"
            className="mt-5 w-full sm:w-auto"
            loading={busy}
            onClick={() => void start()}
          >
            Start my application
          </Button>
        </Block>
      </div>
    );
  }

  if (app.state !== "draft") {
    return (
      <div className="max-w-2xl space-y-4">
        <Block title="Your application" action={<DriverStatus value={app.state} />}>
          <p className="text-base text-ink">
            {app.state === "approved"
              ? "Your application is approved. AdVibe will contact you to arrange the screen installation."
              : app.state === "rejected"
                ? "Your application wasn't approved. Contact support if you'd like to know more."
                : app.state === "changes_requested"
                  ? "AdVibe asked for changes. Check your notifications for what to update, or contact support."
                  : "Your application has been sent. An AdVibe admin will review it and let you know."}
          </p>
          <p className="mt-2 text-sm text-ink-muted">Submitted {shortDate(app.submittedAt)}</p>
          <Link
            href="/driver/verification"
            className={cn(buttonVariants({ variant: "outline" }), "mt-4")}
          >
            See verification details
          </Link>
        </Block>
      </div>
    );
  }

  const current = Math.min(app.completedStep + 1, 5);
  const active = editing ?? current;
  const usableVehicles = (vehicles.data ?? []).filter((v) => v.verification !== "rejected");
  const chosenVehicle = usableVehicles.find((v) => v.id === (vehicleId || app.vehicleId));
  const vehicleType = chosenVehicle?.type ?? app.vehicleCategory ?? null;

  function summary(step: number) {
    if (step === 1)
      return `${app!.city ?? "—"}, ${app!.experience ? experienceNames[app!.experience].toLowerCase() : "—"}`;
    if (step === 2) {
      const v = (vehicles.data ?? []).find((x) => x.id === app!.vehicleId);
      return v ? `${vehicleNames[v.type]}, ${v.model} (${v.year})` : (app!.vehicleCategory ?? "—");
    }
    if (step === 3) return app!.screenChoice ?? "—";
    return "";
  }

  return (
    <div className="max-w-2xl space-y-4">
      {notice ? <Alert tone="success">{notice}</Alert> : null}
      {error ? <Alert tone="danger">{error}</Alert> : null}
      <ol className="space-y-3" aria-label="Application steps">
        {stepTitles.map((title, i) => {
          const step = i + 1;
          const done = step <= app.completedStep;
          const locked = step >= 4;
          const isActive = step === active && !locked;
          return (
            <li
              key={title}
              aria-current={isActive ? "step" : undefined}
              className={cn(
                "rounded-lg border bg-surface p-4 sm:p-5",
                isActive ? "border-signal" : "border-line",
              )}
            >
              <div className="flex items-start gap-3">
                <span
                  aria-hidden
                  className={cn(
                    "grid size-8 shrink-0 place-items-center rounded-full border-2 text-sm font-semibold",
                    done && "border-signal bg-signal text-white",
                    isActive && !done && "border-signal text-signal",
                    !done && !isActive && "border-line text-ink-muted",
                  )}
                >
                  {done ? (
                    <Check className="size-4" />
                  ) : locked ? (
                    <Lock className="size-4" />
                  ) : (
                    step
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="font-heading text-base font-semibold text-ink">
                    <span className="sr-only">Step {step}: </span>
                    {title}
                    <span className="sr-only">
                      {done ? " (done)" : locked ? " (not available yet)" : ""}
                    </span>
                  </h2>
                  {done && !isActive && step <= 3 ? (
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 text-sm text-ink-muted">
                      <span>{summary(step)}</span>
                      <Button variant="link" className="min-h-11" onClick={() => setEditing(step)}>
                        Change<span className="sr-only"> {title.toLowerCase()}</span>
                      </Button>
                    </div>
                  ) : null}
                  {locked ? (
                    <p className="mt-1 text-sm text-ink-muted">
                      {step === 4
                        ? "AdVibe hasn't published the partner agreement yet. We'll notify you when you can read and accept it."
                        : "Available after the partner agreement. Then you can check everything and submit."}
                    </p>
                  ) : null}
                </div>
              </div>

              {isActive && step === 1 ? (
                <div className="mt-4 space-y-5">
                  <Field
                    label="City you drive in"
                    htmlFor="onboard-city"
                    error={
                      touched && city.trim().length < 2 ? "Enter the city you drive in." : undefined
                    }
                    required
                  >
                    <Input
                      autoComplete="address-level2"
                      maxLength={100}
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </Field>
                  <fieldset>
                    <legend className="text-sm font-semibold text-ink">
                      How long have you driven for work?
                    </legend>
                    <div className="mt-2 grid gap-2">
                      {(Object.keys(experienceNames) as (keyof typeof experienceNames)[]).map(
                        (k) => (
                          <Choice
                            key={k}
                            name="experience"
                            value={k}
                            checked={experience === k}
                            onChange={() => setExperience(k)}
                            label={experienceNames[k]}
                          />
                        ),
                      )}
                    </div>
                    {touched && !experience ? (
                      <p className="mt-1.5 text-sm font-medium text-danger-fg">
                        Choose one option.
                      </p>
                    ) : null}
                  </fieldset>
                  <Button
                    size="lg"
                    className="w-full sm:w-auto"
                    loading={busy}
                    onClick={() => void saveStep(1)}
                  >
                    Save and continue
                  </Button>
                </div>
              ) : null}

              {isActive && step === 2 ? (
                <div className="mt-4 space-y-4">
                  {usableVehicles.length === 0 ? (
                    <Alert tone="info" title="Add your vehicle first">
                      Add the vehicle you&apos;ll carry the screen on, then come back to this step.
                      <div className="mt-3">
                        <Link href="/driver/vehicle" className={buttonVariants()}>
                          Add my vehicle
                        </Link>
                      </div>
                    </Alert>
                  ) : (
                    <>
                      <fieldset>
                        <legend className="text-sm font-semibold text-ink">
                          Which vehicle will carry the screen?
                        </legend>
                        <div className="mt-2 grid gap-2">
                          {usableVehicles.map((v) => (
                            <Choice
                              key={v.id}
                              name="vehicle"
                              value={v.id}
                              checked={vehicleId === v.id}
                              onChange={() => setVehicleId(v.id)}
                              label={`${vehicleNames[v.type]}, ${v.model}`}
                              hint={`${v.year}`}
                            />
                          ))}
                        </div>
                        {touched && !usableVehicles.some((v) => v.id === vehicleId) ? (
                          <p className="mt-1.5 text-sm font-medium text-danger-fg">
                            Choose a vehicle.
                          </p>
                        ) : null}
                      </fieldset>
                      <Button
                        size="lg"
                        className="w-full sm:w-auto"
                        loading={busy}
                        onClick={() => void saveStep(2)}
                      >
                        Save and continue
                      </Button>
                    </>
                  )}
                </div>
              ) : null}

              {isActive && step === 3 ? (
                <div className="mt-4 space-y-4">
                  {!vehicleType ? (
                    <Alert tone="info">Choose your vehicle in step 2 first.</Alert>
                  ) : (
                    <>
                      <fieldset>
                        <legend className="text-sm font-semibold text-ink">
                          Where should the screen go?
                        </legend>
                        <div className="mt-2 grid gap-2">
                          {screenOptions[vehicleType].map((option) => (
                            <Choice
                              key={option}
                              name="screen"
                              value={option}
                              checked={screenChoice === option}
                              onChange={() => setScreenChoice(option)}
                              label={option}
                            />
                          ))}
                        </div>
                        {touched && !screenChoice ? (
                          <p className="mt-1.5 text-sm font-medium text-danger-fg">
                            Choose a placement.
                          </p>
                        ) : null}
                      </fieldset>
                      <p className="text-sm text-ink-muted">
                        The exact screen is confirmed when AdVibe arranges installation.
                      </p>
                      <Button
                        size="lg"
                        className="w-full sm:w-auto"
                        loading={busy}
                        onClick={() => void saveStep(3)}
                      >
                        Save and continue
                      </Button>
                    </>
                  )}
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>
      {editing ? (
        <Button variant="ghost" onClick={() => setEditing(null)}>
          Cancel changes
        </Button>
      ) : null}
      <p className="text-sm text-ink-muted">
        Started {shortDate(app.createdAt)}. Your progress is saved after each step.
      </p>
    </div>
  );
}
