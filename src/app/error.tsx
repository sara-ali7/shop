"use client";

import { ErrorState } from "@/components/shared/state-views";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main id="main-content" className="mx-auto max-w-xl px-4 py-12">
      <ErrorState
        message="An unexpected error occurred while loading this page."
        onRetry={reset}
      />
    </main>
  );
}
