import type { Metadata } from "next";
import { AdminProductDetail } from "@/components/admin/admin-product-detail";

export const metadata: Metadata = { title: "Product details" };

export default async function AdminProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminProductDetail id={id} />;
}
