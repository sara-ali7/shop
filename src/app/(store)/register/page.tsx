import type { Metadata } from "next";
import { Suspense } from "react";
import { RegisterForm } from "@/components/auth/register-form";
import { Container } from "@/components/layout/container";
import { PageSpinner } from "@/components/shared/state-views";

export const metadata: Metadata = { title: "Create account", description: "Create a new account." };

export default function RegisterPage() {
  return (
    <Container className="py-10">
      <Suspense fallback={<PageSpinner />}>
        <RegisterForm />
      </Suspense>
    </Container>
  );
}
