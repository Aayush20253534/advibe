"use client";

import * as React from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Input } from "./input";

export type Column<T> = {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  /** Enables sorting on this column. */
  sortValue?: (row: T) => string | number | null;
  /** Text matched by the filter box. Defaults to sortValue when that returns a string. */
  filterValue?: (row: T) => string;
  /** Money and counts: right-aligned with tabular numerals. */
  numeric?: boolean;
  className?: string;
};

type SortState = { key: string; direction: "ascending" | "descending" } | null;

export type DataTableProps<T> = {
  /** Describes the table for screen readers and labels its scroll region. */
  caption: string;
  columns: readonly Column<T>[];
  rows: readonly T[];
  getRowId: (row: T) => string;
  /** Shows a filter box with this label, e.g. "Filter campaigns". */
  filterLabel?: string;
  pageSize?: number;
  /** Shown when there are no rows at all (not when a filter matches nothing). */
  empty?: React.ReactNode;
  initialSort?: SortState;
  /** Denser rows for operational (admin) screens. */
  dense?: boolean;
  className?: string;
};

function compare(a: string | number | null, b: string | number | null): number {
  if (a === b) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: "base" });
}

export function DataTable<T>({
  caption,
  columns,
  rows,
  getRowId,
  filterLabel,
  pageSize = 10,
  empty,
  initialSort = null,
  dense = false,
  className,
}: DataTableProps<T>) {
  const captionId = React.useId();
  const filterId = React.useId();
  const [query, setQuery] = React.useState("");
  const [sort, setSort] = React.useState<SortState>(initialSort);
  const [page, setPage] = React.useState(0);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      columns.some((column) => {
        const text =
          column.filterValue?.(row) ??
          (() => {
            const value = column.sortValue?.(row);
            return typeof value === "string" ? value : "";
          })();
        return text.toLowerCase().includes(q);
      }),
    );
  }, [rows, columns, query]);

  const sorted = React.useMemo(() => {
    if (!sort) return filtered;
    const column = columns.find((c) => c.key === sort.key);
    if (!column?.sortValue) return filtered;
    const get = column.sortValue;
    const out = [...filtered].sort((a, b) => compare(get(a), get(b)));
    return sort.direction === "descending" ? out.reverse() : out;
  }, [filtered, columns, sort]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const current = Math.min(page, pageCount - 1);
  const visible = sorted.slice(current * pageSize, current * pageSize + pageSize);
  const first = sorted.length ? current * pageSize + 1 : 0;
  const last = current * pageSize + visible.length;

  function toggleSort(key: string) {
    setPage(0);
    setSort((old) =>
      old?.key !== key
        ? { key, direction: "ascending" }
        : old.direction === "ascending"
          ? { key, direction: "descending" }
          : null,
    );
  }

  if (!rows.length && empty) return <>{empty}</>;

  const cellPad = dense ? "px-3 py-2" : "px-4 py-3";

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {filterLabel ? (
        <div className="relative max-w-sm">
          <label htmlFor={filterId} className="sr-only">
            {filterLabel}
          </label>
          <Search
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-muted"
          />
          <Input
            id={filterId}
            type="search"
            placeholder={filterLabel}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(0);
            }}
            className="pl-9"
          />
        </div>
      ) : null}
      <div
        role="region"
        aria-labelledby={captionId}
        tabIndex={0}
        className="overflow-x-auto rounded-lg border border-line bg-surface focus-visible:outline-2 focus-visible:outline-signal"
      >
        <table className="w-full border-collapse text-left text-sm">
          <caption id={captionId} className="sr-only">
            {caption}
          </caption>
          <thead className="bg-paper">
            <tr className="border-b border-line">
              {columns.map((column) => {
                const active = sort?.key === column.key;
                return (
                  <th
                    key={column.key}
                    scope="col"
                    aria-sort={active ? sort.direction : undefined}
                    className={cn(
                      "font-semibold whitespace-nowrap text-ink-muted",
                      cellPad,
                      column.numeric && "text-right",
                      column.className,
                    )}
                  >
                    {column.sortValue ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(column.key)}
                        className={cn(
                          "-mx-1 inline-flex min-h-8 items-center gap-1 rounded-md px-1 hover:text-ink focus-visible:outline-2 focus-visible:outline-signal",
                          active && "text-ink",
                        )}
                      >
                        {column.header}
                        {active ? (
                          sort.direction === "ascending" ? (
                            <ArrowUp className="size-4" aria-hidden />
                          ) : (
                            <ArrowDown className="size-4" aria-hidden />
                          )
                        ) : (
                          <ArrowUpDown className="size-4 opacity-50" aria-hidden />
                        )}
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {visible.length ? (
              visible.map((row) => (
                <tr key={getRowId(row)} className="border-b border-line last:border-0">
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      data-numeric={column.numeric ? "" : undefined}
                      className={cn(
                        "text-ink",
                        cellPad,
                        column.numeric && "text-right whitespace-nowrap",
                        column.className,
                      )}
                    >
                      {column.cell(row)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-ink-muted">
                  No rows match “{query}”. Clear the filter to see all {rows.length}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-ink-muted">
        <p aria-live="polite" className="tabular-nums">
          {sorted.length ? `Showing ${first}–${last} of ${sorted.length}` : "No results"}
        </p>
        {pageCount > 1 ? (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={current === 0}
              onClick={() => setPage(current - 1)}
            >
              Previous page
            </Button>
            <span className="tabular-nums">
              Page {current + 1} of {pageCount}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={current >= pageCount - 1}
              onClick={() => setPage(current + 1)}
            >
              Next page
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
