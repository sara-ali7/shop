import Link from "next/link";
import { CategoryGrid } from "@/components/category/category-grid";
import { Container } from "@/components/layout/container";
import { ProductGrid } from "@/components/product/product-grid";
import { SafeImage } from "@/components/shared/safe-image";
import { EmptyState, ErrorState } from "@/components/shared/state-views";
import { Button } from "@/components/ui/button";
import { getCategories } from "@/lib/api/categories";
import { getErrorMessage } from "@/lib/api/client";
import { getProductsPage } from "@/lib/api/products";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categoriesResult, productsResult] = await Promise.allSettled([
    getCategories(),
    getProductsPage(0, 8),
  ]);

  return (
    <>
      <section className="border-b bg-muted/40">
        <Container className="py-10 sm:py-14">
          <div className="grid items-center gap-8 md:grid-cols-12 lg:gap-12">

            <div className="md:col-span-5 lg:col-span-5">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border bg-muted shadow-sm sm:aspect-square">
                <SafeImage
                  src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=80"
                  alt="Everyday shopping bags and common retail products"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            <div className="md:col-span-7 lg:col-span-7">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                Everyday products, simply organised.
              </h1>
              <p className="mt-3 max-w-xl text-base text-muted-foreground sm:text-lg">
                Browse by category, search and filter the catalogue, and check out in a few steps.
                This is a demo store: orders are simulated.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="/products">Browse all products</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/categories">View categories</Link>
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <Container className="space-y-12 py-10">
        <section aria-labelledby="categories-heading">
          <div className="mb-4 flex items-end justify-between gap-3">
            <h2 id="categories-heading" className="text-xl font-semibold">
              Shop by category
            </h2>
            <Link href="/categories" className="text-sm hover:underline">
              All categories
            </Link>
          </div>
          {categoriesResult.status === "rejected" ? (
            <ErrorState
              title="Could not load categories"
              message={getErrorMessage(categoriesResult.reason)}
              retryHref="/"
              retryLabel="Reload page"
            />
          ) : categoriesResult.value.length === 0 ? (
            <EmptyState title="No categories yet" />
          ) : (
            <CategoryGrid categories={categoriesResult.value.slice(0, 4)} />
          )}
        </section>

        <section aria-labelledby="products-heading">
          <div className="mb-4 flex items-end justify-between gap-3">
            <h2 id="products-heading" className="text-xl font-semibold">
              Featured products
            </h2>
            <Link href="/products" className="text-sm hover:underline">
              All products
            </Link>
          </div>
          {productsResult.status === "rejected" ? (
            <ErrorState
              title="Could not load products"
              message={getErrorMessage(productsResult.reason)}
              retryHref="/"
              retryLabel="Reload page"
            />
          ) : productsResult.value.length === 0 ? (
            <EmptyState title="No products available" message="Please check back later." />
          ) : (
            <ProductGrid products={productsResult.value} />
          )}
        </section>
      </Container>
    </>
  );
}
