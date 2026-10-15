import type { Metadata } from "next";
import { ProductForm } from "@/components/admin/product-form";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = { title: "New product" };

export default function NewProductPage() {
  return (
    <>
      <PageHeader title="New product" description="Creates a real record in the shared API." />
      <ProductForm />
    </>
  );
}
