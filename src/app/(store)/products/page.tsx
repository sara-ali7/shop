import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/layout/container";
import { ProductsExplorer } from "@/components/product/products-explorer";
import { ProductGridSkeleton } from "@/components/product/product-grid";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = {
  title: "Products",
  description: "Browse, search, filter and sort every product in the store.",
};

export default function ProductsPage() {
  return (
    <Container className="py-8">
      <PageHeader title="Products" description="Search, filter by category or price, and sort the catalogue." />
      <Suspense fallback={<ProductGridSkeleton count={8} />}>
        <ProductsExplorer />
      </Suspense>
    </Container>
  );
}
