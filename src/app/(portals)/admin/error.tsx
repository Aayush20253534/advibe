"use client";

import { Button, ErrorState } from "@/components/ui";

export default function PortalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <ErrorState
      title="This page couldn’t load"
      description="Something went wrong while showing this page. Try again; if it keeps happening, contact support."
      action={<Button onClick={reset}>Try again</Button>}
    />
  );
}
