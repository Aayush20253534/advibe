import Link from "next/link";
import { buttonVariants } from "@/components/ui";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-paper px-6 text-center">
      <p className="text-sm font-semibold text-signal">404</p>
      <h1 className="font-heading text-3xl font-semibold text-ink">Page not found</h1>
      <p className="max-w-md text-sm text-ink-muted">
        This page doesn&apos;t exist or the address is wrong.
      </p>
      <Link href="/" className={buttonVariants({ variant: "primary", size: "lg" })}>
        Back to home
      </Link>
    </main>
  );
}
