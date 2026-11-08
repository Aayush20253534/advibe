"use client";

import * as React from "react";
import { Info, Plus, Trash2 } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
  DataTable,
  DateInput,
  Dialog,
  Drawer,
  EmptyState,
  ErrorState,
  Field,
  Input,
  Metric,
  PageHeader,
  PermissionDeniedState,
  Popover,
  Select,
  SkeletonList,
  StatusBadge,
  SuccessState,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsRoot,
  TabsTrigger,
  Textarea,
  Tooltip,
  type Column,
  type StatusTone,
} from "@/components/ui";

const colours = [
  { token: "ink", hex: "#171A20", role: "Text, sidebar, dark surfaces", dark: true },
  { token: "night", hex: "#15181E", role: "Hero and footer only", dark: true },
  { token: "signal", hex: "#1958F5", role: "The only action and selection colour", dark: true },
  { token: "beacon", hex: "#1958F5", role: "Legacy action alias, white text", dark: true },
  { token: "paper", hex: "#F6F7F9", role: "App background" },
  { token: "line", hex: "#E0E3E9", role: "Borders and dividers" },
  { token: "line-strong", hex: "#7C8594", role: "Form control borders" },
  { token: "ink-muted", hex: "#555E6C", role: "Secondary text", dark: true },
] as const;

const statusColours = [
  { name: "Success", bg: "bg-success-bg", fg: "text-success-fg", border: "border-success-border" },
  { name: "Warning", bg: "bg-warning-bg", fg: "text-warning-fg", border: "border-warning-border" },
  { name: "Danger", bg: "bg-danger-bg", fg: "text-danger-fg", border: "border-danger-border" },
  { name: "Info", bg: "bg-info-bg", fg: "text-info-fg", border: "border-info-border" },
] as const;

type SampleRow = {
  id: string;
  name: string;
  status: { label: string; tone: StatusTone };
  start: string;
  amountPaise: number;
};

const statuses: SampleRow["status"][] = [
  { label: "Draft", tone: "neutral" },
  { label: "In review", tone: "info" },
  { label: "Approved", tone: "success" },
  { label: "Changes requested", tone: "warning" },
  { label: "Live", tone: "live" },
];

// Clearly labelled sample rows for demonstrating table behaviour. Not real data.
const sampleRows: SampleRow[] = Array.from({ length: 23 }, (_, i) => ({
  id: "sample-" + (i + 1),
  name: "Sample campaign " + String(i + 1).padStart(2, "0"),
  status: statuses[i % statuses.length]!,
  start: new Date(Date.UTC(2026, 10, 1 + i * 2)).toISOString().slice(0, 10),
  amountPaise: ((i * 7919) % 50000) * 100 + 150000,
}));

const rupees = (paise: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(paise / 100);

const columns: Column<SampleRow>[] = [
  { key: "name", header: "Campaign", cell: (r) => r.name, sortValue: (r) => r.name },
  {
    key: "status",
    header: "Status",
    cell: (r) => <StatusBadge tone={r.status.tone}>{r.status.label}</StatusBadge>,
    sortValue: (r) => r.status.label,
  },
  { key: "start", header: "Start date", cell: (r) => r.start, sortValue: (r) => r.start },
  {
    key: "amount",
    header: "Quoted amount",
    numeric: true,
    cell: (r) => rupees(r.amountPaise),
    sortValue: (r) => r.amountPaise,
  },
];

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="border-t border-line py-10">
      <h2 id={id} className="font-heading text-xl font-semibold text-ink">
        {title}
      </h2>
      {description ? <p className="mt-1 max-w-2xl text-sm text-ink-muted">{description}</p> : null}
      <div className="mt-6">{children}</div>
    </section>
  );
}

function ValidationDemo() {
  const [title, setTitle] = React.useState("");
  const [start, setStart] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const titleError =
    submitted && title.trim().length < 3
      ? "Enter a campaign title of at least 3 characters."
      : undefined;
  const startError = submitted && !start ? "Choose the date the campaign should start." : undefined;
  return (
    <form
      noValidate
      className="grid max-w-xl gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
        setSaved(title.trim().length >= 3 && Boolean(start));
      }}
    >
      <Field
        label="Campaign title"
        htmlFor="ds-title"
        description="Shown to reviewers and on invoices."
        error={titleError}
        required
      >
        <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={180} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Start date" htmlFor="ds-start" error={startError} required>
          <DateInput value={start} onChange={(e) => setStart(e.target.value)} />
        </Field>
        <Field label="Placement" htmlFor="ds-placement">
          <Select defaultValue="car">
            <option value="car">Car interior screen</option>
            <option value="auto">Auto rickshaw rear screen</option>
            <option value="bike">Bike-mounted screen</option>
          </Select>
        </Field>
      </div>
      <Field
        label="Notes for the reviewer"
        htmlFor="ds-notes"
        description="Optional. Up to 500 characters."
      >
        <Textarea maxLength={500} />
      </Field>
      <Checkbox
        label="Weekdays only"
        description="Skip Saturday and Sunday deliveries."
        defaultChecked
      />
      {saved ? (
        <Alert tone="success" title="Draft saved">
          Nothing is submitted or charged until you choose “Submit for review”.
        </Alert>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button type="submit">Save draft</Button>
        <Button
          variant="ghost"
          onClick={() => {
            setTitle("");
            setStart("");
            setSubmitted(false);
            setSaved(false);
          }}
        >
          Clear form
        </Button>
      </div>
    </form>
  );
}

export function DesignSystemShowcase() {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [segment, setSegment] = React.useState("all");
  const [alerts, setAlerts] = React.useState(true);

  return (
    <main id="main" className="min-h-screen bg-paper">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <PageHeader
          breadcrumbs={[{ label: "Internal" }, { label: "Design system" }]}
          title="BlinkMyAd design system"
          description="Tokens and components shared by the public site and the advertiser, driver and admin portals. Internal reference: not linked from the site and not indexed by search engines."
          actions={
            // Inverse BlinkMyAd wordmark for a charcoal surface.
            <div className="rounded-lg bg-night px-4 py-3">
              <BrandLogo inverse width={140} />
            </div>
          }
        />

        <Section
          id="colour"
          title="Colour"
          description="Semantic tokens defined once in globals.css. Signal is the only action colour; beacon is reserved for the main marketing call to action and live state, always with ink text."
        >
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {colours.map((c) => (
              <li
                key={c.token}
                className="overflow-hidden rounded-lg border border-line bg-surface"
              >
                <div
                  className="flex h-16 items-end p-3 text-sm font-semibold"
                  style={{ background: c.hex, color: "dark" in c ? "#fff" : "#041b3d" }}
                >
                  {c.token}
                </div>
                <div className="p-3 text-sm">
                  <p className="font-mono text-ink">{c.hex}</p>
                  <p className="text-ink-muted">{c.role}</p>
                </div>
              </li>
            ))}
          </ul>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {statusColours.map((s) => (
              <li
                key={s.name}
                className={`rounded-lg border p-3 text-sm font-semibold ${s.bg} ${s.fg} ${s.border}`}
              >
                {s.name}: text on background meets 4.5:1
              </li>
            ))}
          </ul>
        </Section>

        <Section
          id="type"
          title="Typography"
          description="Overpass for headings and display text only; the platform UI font for everything else. 12px minimum, sentence case, tabular numerals for money and metrics."
        >
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-3">
              <p className="font-heading text-4xl font-bold text-ink">Display 48</p>
              <p className="font-heading text-3xl font-bold text-ink">Heading 36</p>
              <p className="font-heading text-2xl font-semibold text-ink">Heading 24</p>
              <p className="font-heading text-xl font-semibold text-ink">Heading 20</p>
              <p className="font-heading text-lg font-semibold text-ink">Heading 18</p>
            </div>
            <div className="space-y-3 text-ink">
              <p className="text-base">Body 16: plain, active and specific sentences.</p>
              <p className="text-sm">Small 14: table cells, form hints and secondary text.</p>
              <p className="text-xs">Caption 12: the smallest size used anywhere.</p>
              <table className="mt-2 text-sm">
                <caption className="sr-only">Tabular numerals example</caption>
                <tbody>
                  {[1250000, 98000, 4500000].map((v) => (
                    <tr key={v}>
                      <th scope="row" className="pr-6 text-left font-normal text-ink-muted">
                        Sample amount
                      </th>
                      <td data-numeric="" className="text-right">
                        {rupees(v)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Section>

        <Section
          id="buttons"
          title="Buttons"
          description="Labels say exactly what happens. One primary action per area."
        >
          <div className="flex flex-wrap items-center gap-3">
            <Button>Submit for review</Button>
            <Button variant="brand">Start advertising</Button>
            <Button variant="secondary">Save draft</Button>
            <Button variant="outline">Download invoice</Button>
            <Button variant="ghost">Cancel</Button>
            <Button variant="destructive">Delete draft</Button>
            <Button variant="link">View pricing details</Button>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button size="lg">Large</Button>
            <Button loading>Saving draft</Button>
            <Button disabled>Unavailable</Button>
            <Tooltip content="Add a campaign">
              <Button size="icon" aria-label="Add a campaign">
                <Plus className="size-5" aria-hidden />
              </Button>
            </Tooltip>
            <Tooltip content="Delete draft">
              <Button size="icon" variant="outline" aria-label="Delete draft">
                <Trash2 className="size-5" aria-hidden />
              </Button>
            </Tooltip>
          </div>
        </Section>

        <Section
          id="forms"
          title="Forms and validation"
          description="Labels above controls, hints before the field, errors after it with an icon. Submit the empty form to see validation."
        >
          <ValidationDemo />
          <div className="mt-6 flex items-center gap-3">
            <Switch checked={alerts} onCheckedChange={setAlerts} aria-label="Email alerts" />
            <span className="text-sm text-ink">Email alerts are {alerts ? "on" : "off"}</span>
          </div>
        </Section>

        <Section
          id="status"
          title="Badges and status"
          description="Status always has a text label; colour is never the only signal."
        >
          <div className="flex flex-wrap gap-2">
            <StatusBadge tone="neutral">Draft</StatusBadge>
            <StatusBadge tone="info">In review</StatusBadge>
            <StatusBadge tone="success">Approved</StatusBadge>
            <StatusBadge tone="warning">Changes requested</StatusBadge>
            <StatusBadge tone="danger">Rejected</StatusBadge>
            <StatusBadge tone="live">Live</StatusBadge>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge>Car interior</Badge>
            <Badge tone="info">New</Badge>
            <Badge tone="warning">Payments disabled</Badge>
          </div>
        </Section>

        <Section id="alerts" title="Alerts">
          <div className="grid gap-3 lg:grid-cols-2">
            <Alert tone="info" title="Drafts are free">
              Drafts are not booked or charged until an admin approves them.
            </Alert>
            <Alert tone="success" title="Creative approved">
              You can now submit campaigns that use “Diwali offer 15s”.
            </Alert>
            <Alert tone="warning" title="Upload a creative first">
              Campaigns need an approved creative. Upload one in the creative library.
            </Alert>
            <Alert
              tone="danger"
              title="Couldn’t save the draft"
              action={<Button size="sm">Try again</Button>}
            >
              The connection dropped before the server confirmed. Nothing was charged.
            </Alert>
          </div>
        </Section>

        <Section id="cards" title="Cards and metrics" description="Sample values for layout only.">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Metric label="Campaigns in review" value="3" />
            <Metric label="Approved creatives" value="12" />
            <Metric label="Quoted this month" value={rupees(4512000)} hint="Before tax" />
            <Metric label="Open support tickets" value="0" />
          </div>
          <Card className="mt-4 max-w-xl">
            <CardHeader>
              <CardTitle>Billing details</CardTitle>
              <CardDescription>
                Used on invoices for every campaign in this business.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-ink">
              Cards group related content. They have a border and no shadow by default.
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm">
                Edit billing details
              </Button>
            </CardFooter>
          </Card>
        </Section>

        <Section
          id="table"
          title="Data table"
          description="Sortable headers, a filter box and pagination. Money is right-aligned with tabular numerals. Sample rows, not real campaigns."
        >
          <DataTable
            caption="Sample campaigns"
            columns={columns}
            rows={sampleRows}
            getRowId={(r) => r.id}
            filterLabel="Filter campaigns"
            pageSize={8}
          />
        </Section>

        <Section
          id="overlays"
          title="Dialog, drawer, popover and tooltip"
          description="Dialogs and drawers trap focus, close on Escape and return focus to the button that opened them."
        >
          <div className="flex flex-wrap gap-3">
            <Button variant="destructive" onClick={() => setDialogOpen(true)}>
              Reject creative
            </Button>
            <Button variant="outline" onClick={() => setDrawerOpen(true)}>
              View campaign details
            </Button>
            <Popover
              label="What counts as a screen-day"
              trigger={
                <Button variant="ghost">
                  <Info className="size-4" aria-hidden />
                  What is a screen-day?
                </Button>
              }
            >
              <p className="font-semibold">Screen-day</p>
              <p className="mt-1 text-ink-muted">
                One screen showing your creative during its scheduled hours on one day.
              </p>
            </Popover>
          </div>
          <Dialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            title="Reject this creative?"
            description="The advertiser sees your reason and can upload a new version."
            footer={
              <>
                <Button variant="ghost" onClick={() => setDialogOpen(false)}>
                  Keep in review
                </Button>
                <Button variant="destructive" onClick={() => setDialogOpen(false)}>
                  Reject creative
                </Button>
              </>
            }
          >
            <Field label="Reason for rejection" htmlFor="ds-reason" required>
              <Textarea placeholder="For example: text is unreadable at screen size." />
            </Field>
          </Dialog>
          <Drawer
            open={drawerOpen}
            onOpenChange={setDrawerOpen}
            title="Sample campaign 01"
            description="Draft · created for demonstration"
            footer={<Button onClick={() => setDrawerOpen(false)}>Close details</Button>}
          >
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm">
              <dt className="text-ink-muted">Status</dt>
              <dd>
                <StatusBadge>Draft</StatusBadge>
              </dd>
              <dt className="text-ink-muted">Start date</dt>
              <dd>2026-11-01</dd>
              <dt className="text-ink-muted">Placement</dt>
              <dd>Car interior screen</dd>
            </dl>
          </Drawer>
        </Section>

        <Section
          id="tabs"
          title="Tabs and segmented choice"
          description="Tabs switch content panels. A segmented choice filters what is shown."
        >
          <Tabs
            label="Campaign status"
            value={segment}
            onValueChange={setSegment}
            tabs={[
              { value: "all", label: "All" },
              { value: "review", label: "In review" },
              { value: "live", label: "Live" },
            ]}
          />
          <TabsRoot defaultValue="overview" className="mt-6">
            <TabsList aria-label="Campaign sections">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="creatives">Creatives</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="text-sm text-ink">
              The overview panel. Arrow keys move between tabs; Tab moves into this panel.
            </TabsContent>
            <TabsContent value="creatives" className="text-sm text-ink">
              The creatives panel.
            </TabsContent>
            <TabsContent value="schedule" className="text-sm text-ink">
              The schedule panel.
            </TabsContent>
          </TabsRoot>
        </Section>

        <Section
          id="loading"
          title="Loading"
          description="Placeholders keep the layout steady and announce loading to screen readers."
        >
          <div className="max-w-xl">
            <SkeletonList rows={3} label="Loading campaigns" />
          </div>
        </Section>

        <Section
          id="states"
          title="Empty, error, success and permission states"
          description="Each says what happened and offers the next step."
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <EmptyState
              headingLevel={3}
              title="No campaigns yet"
              description="Create a draft to choose screens, dates and a creative. Drafts are free."
              action={<Button>Create campaign draft</Button>}
            />
            <ErrorState
              headingLevel={3}
              title="Campaigns couldn’t load"
              description="The server didn’t respond. Check your connection, then try again."
              action={<Button variant="outline">Try again</Button>}
            />
            <SuccessState
              headingLevel={3}
              title="Submitted for review"
              description="An admin usually reviews within one working day. We’ll notify you here."
              action={<Button variant="outline">View campaign</Button>}
            />
            <PermissionDeniedState
              headingLevel={3}
              title="This page is for admins"
              description="You’re signed in as an advertiser. Sign in with an admin account to continue."
              action={<Button variant="outline">Switch account</Button>}
            />
          </div>
        </Section>
      </div>
    </main>
  );
}
