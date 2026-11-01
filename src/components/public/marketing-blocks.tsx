import Link from "next/link";
import {
  BadgeCheck,
  BarChart3,
  CarFront,
  Check,
  Clock3,
  FileCheck2,
  Info,
  MapPin,
  Megaphone,
  MonitorPlay,
  ShieldCheck,
  Target,
  UploadCloud,
  UsersRound,
  Wallet,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { FormatPreviewArt } from "@/components/landing/format-preview-art";
import { cn } from "@/lib/utils";
import type { Placement } from "@/types/domain";

// Beacon orange with ink text (5.95:1). Kept as literal values: the contrast test
// (tests/part22-integration.test.mjs) checks this exact pairing.
export const primaryButton =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#ff6a00] px-6 text-base font-semibold text-[#041b3d] transition-colors hover:bg-beacon-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";
export const secondaryButton =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-white/60 px-6 text-base font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";
/** Secondary action on light backgrounds. */
export const outlineButton =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-line-strong bg-surface px-6 text-base font-semibold text-ink transition-colors hover:bg-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal";
/** Inline text link with a visible underline. */
export const textLink =
  "font-semibold text-signal underline underline-offset-4 hover:text-signal-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal";

export const formatCards: {
  title: string;
  type: Placement;
  description: string;
  spec: string;
  best: string;
  icon: LucideIcon;
}[] = [
  {
    title: "Bike-mounted screen",
    type: "bike_rear",
    description: "A compact screen behind the rider, seen by traffic and people on the street.",
    spec: "10–12 inch screen (design example)",
    best: "Local offers and neighbourhood awareness",
    icon: Megaphone,
  },
  {
    title: "Auto rickshaw rear screen",
    type: "auto_rear",
    description: "A rear-facing screen on autos that travel the same local routes every day.",
    spec: "10–12 inch screen (design example)",
    best: "Shops, clinics and local services",
    icon: CarFront,
  },
  {
    title: "Car interior screen",
    type: "car_interior",
    description: "A seat-back screen that passengers see for the length of their ride.",
    spec: "10–15 inch screen (design example)",
    best: "City-wide and premium campaigns",
    icon: MonitorPlay,
  },
  {
    title: "Helmet wrap",
    type: "helmet",
    description: "A printed helmet design. Not a screen, and not scheduled through the platform.",
    spec: "Custom printed wrap",
    best: "Short promotions and events",
    icon: ShieldCheck,
  },
];

/** Page introduction on night. One h1, plain words, no coloured accent. */
export function PageHero({
  title,
  description,
  actions,
  note,
}: {
  title: string;
  description: string;
  actions?: { label: string; href: string; secondary?: boolean }[];
  note?: string;
}) {
  return (
    <section className="bg-night text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
        <h1 className="max-w-3xl font-heading text-4xl font-bold sm:text-5xl">{title}</h1>
        <p className="mt-5 max-w-2xl text-lg text-[#c3d0e4]">{description}</p>
        {actions?.length ? (
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {actions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className={action.secondary ? secondaryButton : primaryButton}
              >
                {action.label}
              </Link>
            ))}
          </div>
        ) : null}
        {note ? <p className="mt-6 max-w-2xl text-sm text-[#9fb0cc]">{note}</p> : null}
      </div>
    </section>
  );
}

export function Heading({
  title,
  description,
  action,
  id,
}: {
  title: string;
  description?: string;
  action?: { label: string; href: string };
  id?: string;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        <h2 id={id} className="font-heading text-2xl font-bold text-ink sm:text-3xl">
          {title}
        </h2>
        {description ? <p className="mt-2 text-base text-ink-muted">{description}</p> : null}
      </div>
      {action ? (
        <Link href={action.href} className={textLink}>
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}

export function Section({
  children,
  muted = false,
  id,
  labelledBy,
}: {
  children: React.ReactNode;
  muted?: boolean;
  id?: string;
  labelledBy?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn("scroll-mt-24 py-14 sm:py-20", muted ? "bg-paper" : "bg-surface")}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">{children}</div>
    </section>
  );
}

/** Points with an icon, title and sentence. A plain list, not a grid of cards. */
export function Benefits({
  items,
}: {
  items: { title: string; text: string; icon: LucideIcon; color?: string }[];
}) {
  return (
    <ul className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
      {items.map(({ title, text, icon: Icon }) => (
        <li key={title} className="flex gap-4">
          <Icon className="mt-1 size-6 shrink-0 text-signal" aria-hidden />
          <div>
            <h3 className="font-heading text-lg font-semibold text-ink">{title}</h3>
            <p className="mt-1 text-base text-ink-muted">{text}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function FormatsGrid({ short = false }: { short?: boolean }) {
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {formatCards.slice(0, short ? 3 : 4).map((f) => (
        <li key={f.type}>
          <Link
            href={"/ad-formats#" + f.type}
            className="group block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal"
          >
            <div className="aspect-[1.75] overflow-hidden rounded-lg border border-line">
              <FormatPreviewArt type={f.type} />
            </div>
            <h3 className="mt-4 font-heading text-lg font-semibold text-ink group-hover:text-signal">
              {f.title}
            </h3>
            <p className="mt-1 text-sm text-ink-muted">{f.description}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Numbered steps. */
export function Steps({ items }: { items: { title: string; text: string; icon: LucideIcon }[] }) {
  return (
    <ol className="grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
      {items.map(({ title, text }, i) => (
        <li key={title} className="bg-surface p-6">
          <span className="font-heading text-sm font-bold text-signal tabular-nums">
            Step {i + 1}
          </span>
          <h3 className="mt-2 font-heading text-lg font-semibold text-ink">{title}</h3>
          <p className="mt-1 text-sm text-ink-muted">{text}</p>
        </li>
      ))}
    </ol>
  );
}

export function CTA({
  title,
  text,
  label,
  href,
}: {
  title: string;
  text: string;
  label: string;
  href: string;
}) {
  return (
    <section className="bg-night text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-14 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <h2 className="font-heading text-2xl font-bold sm:text-3xl">{title}</h2>
          <p className="mt-2 text-base text-[#c3d0e4]">{text}</p>
        </div>
        <Link href={href} className={cn(primaryButton, "shrink-0")}>
          {label}
        </Link>
      </div>
    </section>
  );
}

export const advertiserBenefits = [
  {
    title: "Seen on everyday routes",
    text: "Screens travel the roads people use to commute, shop and run errands, not a single fixed billboard spot.",
    icon: UsersRound,
  },
  {
    title: "You choose where and when",
    text: "Pick the city, the screen format, the dates, the daily hours and the days of the week.",
    icon: Target,
  },
  {
    title: "Small budgets work",
    text: "Pricing is per screen, per day, so a short local campaign is possible without a large commitment.",
    icon: Wallet,
  },
  {
    title: "Reviewed before it runs",
    text: "Every creative and every campaign is checked by an AdVibe admin before it is scheduled.",
    icon: BadgeCheck,
  },
];
export const driverBenefits = [
  {
    title: "Earn on routes you already drive",
    text: "The screen shows approved ads while you work as usual. You don't change your routes.",
    icon: Wallet,
  },
  {
    title: "Installation is arranged for you",
    text: "Once you are verified, the screen is installed and paired with your account in a supervised visit.",
    icon: CarFront,
  },
  {
    title: "Earnings you can check",
    text: "Your partner portal shows each earning entry and payout status as AdVibe records them.",
    icon: Clock3,
  },
  {
    title: "Help when the screen has a problem",
    text: "Report a fault from the partner portal and follow the maintenance case until it is closed.",
    icon: Wrench,
  },
];
export const advertiserSteps = [
  {
    title: "Create your account",
    text: "Register as an advertiser and add your business.",
    icon: UsersRound,
  },
  {
    title: "Upload a creative",
    text: "Upload your image or video. An admin checks it against the screen specifications.",
    icon: UploadCloud,
  },
  {
    title: "Build a campaign draft",
    text: "Choose dates, daily hours and days. Drafts are free and can be changed.",
    icon: MapPin,
  },
  {
    title: "Submit for review",
    text: "An AdVibe admin approves the campaign before anything is scheduled.",
    icon: BarChart3,
  },
];
export const driverSteps = [
  {
    title: "Create your account",
    text: "Register as a driver partner and verify your email.",
    icon: UsersRound,
  },
  {
    title: "Apply and upload documents",
    text: "Add your vehicle and upload your licence, RC, insurance and ID for verification.",
    icon: FileCheck2,
  },
  {
    title: "Get the screen installed",
    text: "After approval, the screen is installed and paired with your account.",
    icon: MonitorPlay,
  },
  {
    title: "Start receiving ad assignments",
    text: "Approved campaigns are assigned to your screen and earnings appear in your portal.",
    icon: Wallet,
  },
];

export function InfoNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-6 flex gap-3 rounded-lg border border-info-border bg-info-bg p-4 text-sm text-ink">
      <Info className="mt-0.5 size-4 shrink-0 text-info-fg" aria-hidden />
      <span>{children}</span>
    </p>
  );
}

export function Requirements() {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {[
        "Valid driving licence",
        "Vehicle registration certificate (RC)",
        "Vehicle insurance and PUC certificate",
        "An eligible vehicle in good condition",
        "Bank account for payouts",
        "Signed partner agreement",
      ].map((x) => (
        <li key={x} className="flex items-start gap-2 text-base text-ink">
          <Check className="mt-1 size-4 shrink-0 text-success-fg" aria-hidden />
          {x}
        </li>
      ))}
    </ul>
  );
}
