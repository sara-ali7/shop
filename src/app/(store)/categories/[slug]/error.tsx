"use client";

import { Container } from "@/components/layout/container";
import { ErrorState } from "@/components/shared/state-views";

export default function CategoryError({ reset }: { error: Error; reset: () => void }) {
  return (
    <Container className="py-12">
      <ErrorState
        title="Could not load this category"
        message="The category service did not respond. Check your connection and try again."
        onRetry={reset}
      />
    </Container>
  );
}
