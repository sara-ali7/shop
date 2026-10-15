import type { Metadata } from "next";
import { AdminUsersList } from "@/components/admin/admin-users";

export const metadata: Metadata = { title: "Users" };

export default function AdminUsersPage() {
  return <AdminUsersList />;
}
