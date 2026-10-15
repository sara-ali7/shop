import type { Metadata } from "next";
import { AdminProductsList } from "@/components/admin/admin-products-list";

export const metadata: Metadata = { title: "Products" };

export default function AdminProductsPage() {
  return <AdminProductsList />;
}
