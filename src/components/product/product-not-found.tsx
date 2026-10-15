import { Container } from "@/components/layout/container";
import { EmptyState } from "@/components/shared/state-views";

export function ProductNotFound() {
  return (
    <Container className="py-12">
      <EmptyState
        title="Product not found"
        message="This product may have been removed, or the link is incorrect."
        action={{ label: "Back to products", href: "/products" }}
      />
    </Container>
  );
}
