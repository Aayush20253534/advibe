"use client";

import { useEffect } from "react";
import type { LiveSession } from "./api-client";

/** Hide private UI at the server-issued expiry even if a tab stays open and idle. */
export function useSessionExpiry(session: LiveSession | null, expire: () => void) {
  const expiresAt = session?.expiresAt;
  useEffect(() => {
    if (!expiresAt) return;
    const remaining = Date.parse(expiresAt) - Date.now();
    const timer = window.setTimeout(expire, Number.isFinite(remaining) ? Math.max(0, remaining) : 0);
    return () => window.clearTimeout(timer);
  }, [expiresAt, expire]);
}
