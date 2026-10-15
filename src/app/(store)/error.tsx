"use client";

import { Container } from "@/components/layout/container";
import { ErrorState } from "@/components/shared/state-views";

export default function StoreError({ reset }: { error: Error; reset: () => void }) {
  return (
    <Container className="py-12">
      <ErrorState
        message="We could not load this page. Check your connection and try again."
        onRetry={reset}
      />
    </Container>
  );
}
