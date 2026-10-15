import type { Metadata } from "next";
import { CartView } from "@/components/cart/cart-view";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = { title: "Cart", description: "Review the items in your cart." };

export default function CartPage() {
  return (
    <Container className="py-8">
      <PageHeader title="Your cart" />
      <CartView />
    </Container>
  );
}
