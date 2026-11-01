import * as React from "react";
import Link from "next/link";
import { LoaderCircle, Lock } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { Alert, buttonVariants, Button } from "@/components/ui";

/** Full-page status while a portal verifies the session with the backend. */
export function PortalLoading({ message }: { message: string }) {
  return (
    <main role="status" className="grid min-h-dvh place-items-center bg-paper px-4">
      <p className="flex items-center gap-3 text-base text-ink-muted">
        <LoaderCircle className="size-5 text-signal motion-safe:animate-spin" aria-hidden />
        {message}
      </p>
    </main>
  );
}

/**
 * Shown when there is no valid session for this portal (signed out, expired
 * or the wrong role). Only presentation: the portal decides when to show it
 * and supplies the sign-in link and optional retry action.
 */
export function PortalAccessRequired({
  title,
  message,
  signInHref,
  signInLabel,
  onRetry,
  retryLabel,
}: {
  title: string;
  message: string;
  signInHref: string;
  signInLabel: string;
  onRetry?: () => void;
  retryLabel?: string;
}) {
  return (
    <main className="grid min-h-dvh place-items-center bg-paper px-4 py-10">
      <div className="w-full max-w-md overflow-hidden rounded-lg border border-line bg-surface">
        <div className="bg-night px-6 py-4">
          <BrandLogo href="/" width={132} />
        </div>
        <div className="space-y-5 p-6">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-warning-bg text-warning-fg">
              <Lock className="size-5" aria-hidden />
            </span>
            <h1 className="pt-1.5 font-heading text-xl font-semibold text-ink">{title}</h1>
          </div>
          <Alert tone="danger">{message}</Alert>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link href={signInHref} className={buttonVariants({ variant: "primary" })}>
              {signInLabel}
            </Link>
            {onRetry && retryLabel ? (
              <Button variant="outline" onClick={onRetry}>
                {retryLabel}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}
