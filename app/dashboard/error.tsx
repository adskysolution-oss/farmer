"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/70 px-6 py-12 text-center">
      <h2 className="font-display text-2xl font-semibold">Dashboard failed to load</h2>
      <p className="mt-3 max-w-lg text-sm text-muted-foreground">
        There was an unexpected issue while loading the operational summary. Use the retry action below after the server recovers.
      </p>
      <Button className="mt-6" onClick={reset}>
        Retry Dashboard
      </Button>
    </div>
  );
}
