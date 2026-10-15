import type { Metadata } from "next";
import { RequireAuth } from "@/components/auth/require-auth";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default function CheckoutPage() {
  return (
    <Container className="py-8">
      <PageHeader title="Checkout" />
      <RequireAuth>
        <CheckoutForm />
      </RequireAuth>
    </Container>
  );
}
