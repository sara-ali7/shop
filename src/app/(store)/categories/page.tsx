import type { Metadata } from "next";
import { CategoryGrid } from "@/components/category/category-grid";
import { Container } from "@/components/layout/container";
import { EmptyState, ErrorState } from "@/components/shared/state-views";
import { PageHeader } from "@/components/shared/page-header";
import { getCategories } from "@/lib/api/categories";
import { getErrorMessage } from "@/lib/api/client";

export const metadata: Metadata = {
  title: "Categories",
  description: "Browse every product category.",
};
export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  let content: React.ReactNode;
  try {
    const categories = await getCategories();
    content =
      categories.length === 0 ? (
        <EmptyState title="No categories yet" message="Categories will appear here once they are added." />
      ) : (
        <CategoryGrid categories={categories} />
      );
  } catch (error) {
    content = (
      <ErrorState
        title="Could not load categories"
        message={getErrorMessage(error)}
        retryHref="/categories"
        retryLabel="Reload page"
      />
    );
  }

  return (
    <Container className="py-8">
      <PageHeader title="Categories" description="Pick a category to see its products." />
      {content}
    </Container>
  );
}
