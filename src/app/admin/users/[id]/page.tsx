import type { Metadata } from "next";
import { AdminUserDetail } from "@/components/admin/admin-users";

export const metadata: Metadata = { title: "User details" };

export default async function AdminUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminUserDetail id={id} />;
}
