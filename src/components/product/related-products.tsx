"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useAsync } from "@/hooks/use-async";
import { getRelatedProducts } from "@/lib/api/products";
import { getErrorMessage } from "@/lib/api/client";
import { ProductGrid, ProductGridSkeleton } from "./product-grid";

export function RelatedProducts({ productId }: { productId: number }) {
  const { data, error, loading, reload } = useAsync(() => getRelatedProducts(productId), [productId]);

  const related = (data ?? []).filter((p) => p.id !== productId).slice(0, 4);

  if (!loading && !error && related.length === 0) return null;

  return (
    <section aria-labelledby="related-heading" className="mt-12">
      <h2 id="related-heading" className="mb-4 text-xl font-semibold">
        Related products
      </h2>
      {loading && <ProductGridSkeleton count={4} />}
      {error && (
        <Alert variant="destructive" className="flex items-center justify-between gap-3">
          <AlertDescription>Could not load related products. {getErrorMessage(error)}</AlertDescription>
          <Button size="sm" variant="outline" onClick={reload}>
            Retry
          </Button>
        </Alert>
      )}
      {!loading && !error && <ProductGrid products={related} />}
    </section>
  );
}
