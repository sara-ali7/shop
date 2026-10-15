import type { Metadata } from "next";
import { AdminProductEdit } from "@/components/admin/admin-product-detail";

export const metadata: Metadata = { title: "Edit product" };

export default async function AdminEditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminProductEdit id={id} />;
}
