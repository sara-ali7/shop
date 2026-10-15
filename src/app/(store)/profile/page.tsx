import type { Metadata } from "next";
import { RequireAuth } from "@/components/auth/require-auth";
import { ProfileView } from "@/components/auth/profile-view";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = { title: "Your profile", robots: { index: false } };

export default function ProfilePage() {
  return (
    <Container className="max-w-2xl py-8">
      <PageHeader title="Your profile" />
      <RequireAuth>
        <ProfileView />
      </RequireAuth>
    </Container>
  );
}
