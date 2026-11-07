import { Button } from "./button";

type Props = {
  busy: boolean;
  hasPrevious: boolean;
  hasNext: boolean;
  onFirst: () => void;
  onNext: () => void;
};

/** Cursor lists retain a route back when the final page has no next cursor. */
export function CursorPagination({ busy, hasPrevious, hasNext, onFirst, onNext }: Props) {
  if (!hasPrevious && !hasNext) return null;
  return (
    <nav aria-label="Record pages" className="flex flex-wrap items-center gap-2 pt-2">
      <Button variant="outline" size="sm" disabled={busy || !hasPrevious} onClick={onFirst}>First page</Button>
      <Button variant="outline" size="sm" disabled={busy || !hasNext} onClick={onNext}>Next page</Button>
      <span role="status" className="text-xs text-ink-muted">{busy ? "Loading records…" : !hasNext ? "Last page" : hasPrevious ? "More records available" : "First page"}</span>
    </nav>
  );
}
