import type { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";
import { Container } from "@/components/layout/container";
import { ProductGrid } from "@/components/product/product-grid";
import { EmptyState } from "@/components/shared/state-views";
import { PageHeader } from "@/components/shared/page-header";
import { getCategoryBySlug, getCategoryProducts } from "@/lib/api/categories";
import { isMissingRecord } from "@/lib/api/client";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const loadCategory = cache(async (slug: string) => {
  try {
    return await getCategoryBySlug(slug);
  } catch (error) {
    if (isMissingRecord(error)) return null;
    throw error;
  }
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const category = await loadCategory(slug);
    if (!category) return { title: "Category not found" };
    return {
      title: category.name,
      description: `Browse ${category.name} products.`,
      openGraph: { title: category.name, images: category.image ? [category.image] : [] },
    };
  } catch {
    return { title: "Category" };
  }
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = await loadCategory(slug);

  if (!category) {
    return (
      <Container className="py-12">
        <EmptyState
          title="Category not found"
          message="This category may have been removed, or the link is incorrect."
          action={{ label: "Back to categories", href: "/categories" }}
        />
      </Container>
    );
  }

  const products = await getCategoryProducts(category.id);

  return (
    <Container className="py-8">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted-foreground">
        <Link href="/categories" className="hover:underline">
          ← All categories
        </Link>
      </nav>
      <PageHeader title={category.name} description={`${products.length} ${products.length === 1 ? "product" : "products"}`} />
      {products.length === 0 ? (
        <EmptyState
          title="No products in this category"
          message="Nothing has been added here yet."
          action={{ label: "Browse all products", href: "/products" }}
        />
      ) : (
        <ProductGrid products={products} />
      )}
    </Container>
  );
}
