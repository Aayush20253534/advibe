"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, MapPin, RefreshCw, Search } from "lucide-react";
import { CursorPagination, Input } from "@/components/ui";
import { cn } from "@/lib/utils";
import { outlineButton } from "./marketing-blocks";
import { apiPage } from "@/services/api-client";
import { PublishedAreaMap } from "./published-area-map";

type PublishedLocation = {
  id: string;
  name: string;
  slug: string;
  zone: string;
  city: string;
  citySlug: string;
  lat: number;
  lng: number;
};


export function LocationSearch() {
  const [locations, setLocations] = React.useState<PublishedLocation[]>([]);
  const [query, setQuery] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [reload, setReload] = React.useState(0);
  const [cursor, setCursor] = React.useState<string | null>(null);
  const [next, setNext] = React.useState<string | null>(null);
  React.useEffect(() => {
    const controller = new AbortController();
    const read = async () => {
      setLoading(true);
      setError("");
      try {
        const payload = await apiPage<PublishedLocation>(
          "/public/locations?citySlug=prayagraj&limit=20" + (cursor ? "&cursor=" + encodeURIComponent(cursor) : ""), controller.signal,
        );
        if (controller.signal.aborted) return;
        setNext(payload.meta.nextCursor ?? null);
        setLocations(payload.data.filter((item) => item.citySlug === "prayagraj"));
      } catch (reason) {
        if (controller.signal.aborted) return;
        setError(reason instanceof Error ? reason.message : "Locations could not be loaded.");
        setLocations([]);
        setNext(null);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    void read();
    return () => controller.abort();
  }, [reload, cursor]);

  const filtered = locations.filter((item) =>
    [item.name, item.zone].some((value) => value.toLowerCase().includes(query.trim().toLowerCase())),
  );

  return (
    <div className="grid gap-7 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.6fr)]">
      <div className="overflow-hidden rounded-xl border border-line bg-surface">
        <div className="border-b border-line p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-heading text-xl font-bold text-ink">Published locations</h2>
              <p className="mt-1 text-sm text-ink-muted">Prayagraj, Uttar Pradesh</p>
            </div>
            <span className="rounded-full bg-signal-soft px-3 py-1.5 text-xs font-semibold text-signal">Single-city launch</span>
          </div>
          <label htmlFor="location-search" className="mt-6 block text-sm font-semibold text-ink">Search areas on this page</label>
          <div className="relative mt-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
            <Input id="location-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search published Prayagraj locations" className="pl-10" />
          </div>
        </div>
        <div aria-live="polite" className="min-h-52">
          {loading ? (
            <div role="status" className="space-y-3 p-6"><div className="h-12 animate-pulse rounded-lg bg-paper" /><div className="h-12 animate-pulse rounded-lg bg-paper" /><span className="sr-only">Loading locations</span></div>
          ) : error ? (
            <div className="p-6" role="alert">
              <h3 className="font-semibold text-ink">Coverage data is unavailable</h3>
              <p className="mt-2 text-sm text-ink-muted">{error}</p>
              <button type="button" onClick={() => setReload((value) => value + 1)} className="mt-4 inline-flex min-h-11 items-center gap-2 font-semibold text-signal"><RefreshCw className="size-4" aria-hidden="true" />Try again</button>
            </div>
          ) : filtered.length ? (
            <ul className="divide-y divide-line">
              {filtered.map((item) => (
                <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-signal-soft p-2"><MapPin className="size-5 text-signal" aria-hidden="true" /></div>
                    <div>
                      <p className="font-semibold text-ink">{item.name}</p>
                      <p className="mt-1 text-sm text-ink-muted">{item.zone}, Prayagraj</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-success-fg">Published area</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-6">
              <h3 className="font-semibold text-ink">{query.trim() ? "No matching published areas" : "No locations published yet"}</h3>
              <p className="mt-2 text-sm leading-6 text-ink-muted">
                {query.trim() ? "Try another Prayagraj locality." : "Screen inventory is still being prepared. We do not display fictional screens as available placements."}
              </p>
            </div>
          )}
        </div>
        <div className="px-5 pb-4"><CursorPagination busy={loading} hasPrevious={!!cursor} hasNext={!!next} onFirst={() => setCursor(null)} onNext={() => setCursor(next)}/></div>
      </div>
      <div className="space-y-5">
      {!loading && !error && <PublishedAreaMap locations={filtered} />}
      <aside className="h-fit rounded-xl border border-line bg-paper p-6">
        <h2 className="font-heading text-xl font-bold text-ink">Plan around Prayagraj</h2>
        <p className="mt-3 leading-7 text-ink-muted">Published areas help you plan a campaign. They are not a guarantee of active screens, booking slots or delivery.</p>
        <div className="mt-6 space-y-4 border-l-2 border-line pl-4 text-sm">
          <div><h3 className="font-semibold text-ink">1. Explore formats</h3><p className="mt-1 text-ink-muted">Choose a supported vehicle-screen placement.</p></div>
          <div><h3 className="font-semibold text-ink">2. Prepare a campaign</h3><p className="mt-1 text-ink-muted">Choose dates and submit the creative for review.</p></div>
          <div><h3 className="font-semibold text-ink">3. Confirm availability</h3><p className="mt-1 text-ink-muted">Inventory and prices are confirmed before booking.</p></div>
        </div>
        <Link href="/signup?role=advertiser" className={cn(outlineButton, "mt-7 w-full")}>Create advertiser account <ArrowUpRight className="ml-2 size-4" aria-hidden="true" /></Link>
      </aside>
      </div>
    </div>
  );
}
