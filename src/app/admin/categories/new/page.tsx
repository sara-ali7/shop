import type { Metadata } from "next";
import { CategoryForm } from "@/components/admin/category-form";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = { title: "New category" };

export default function NewCategoryPage() {
  return (
    <>
      <PageHeader title="New category" description="Creates a real record in the shared API." />
      <CategoryForm />
    </>
  );
}
