import type { Metadata } from "next";
import { AdminCategoryEdit } from "@/components/admin/admin-categories";

export const metadata: Metadata = { title: "Edit category" };

export default async function AdminEditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminCategoryEdit id={id} />;
}
