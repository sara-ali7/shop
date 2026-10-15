import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { Container } from "@/components/layout/container";
import { PageSpinner } from "@/components/shared/state-views";

export const metadata: Metadata = { title: "Log in", description: "Log in to your account." };

export default function LoginPage() {
  return (
    <Container className="py-10">
      <Suspense fallback={<PageSpinner />}>
        <LoginForm />
      </Suspense>
    </Container>
  );
}
