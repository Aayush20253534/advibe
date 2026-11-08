"use client";

import Link from "next/link";
import { Button, ErrorState } from "@/components/ui";

export default function PublicPageError({ reset }: { reset: () => void }) {
  return (
    <div className="mx-auto max-w-2xl px-5 py-16">
      <ErrorState title="This page could not load" description="Try loading the page again. Your account and saved work are unchanged."
        action={<><Button onClick={reset}>Try again</Button><Link href="/" className="inline-flex min-h-11 items-center px-4 text-signal underline">Back to home</Link></>} />
    </div>
  );
}
