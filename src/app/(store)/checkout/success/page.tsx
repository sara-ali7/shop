import type { Metadata } from "next";
import { RequireAuth } from "@/components/auth/require-auth";
import { OrderConfirmation } from "@/components/checkout/order-confirmation";
import { Container } from "@/components/layout/container";

export const metadata: Metadata = { title: "Order confirmation", robots: { index: false } };

export default function CheckoutSuccessPage() {
  return (
    <Container className="py-8">
      <RequireAuth>
        <OrderConfirmation />
      </RequireAuth>
    </Container>
  );
}
