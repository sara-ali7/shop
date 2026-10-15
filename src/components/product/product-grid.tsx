import { Skeleton } from "@/components/ui/skeleton";
import type { Product } from "@/types";
import { ProductCard } from "./product-card";

const GRID = "grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4";

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <ul className={GRID}>
      {products.map((product) => (
        <li key={product.id} className="flex">
          <div className="flex w-full flex-col [&>*]:flex-1">
            <ProductCard product={product} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className={GRID} role="status" aria-label="Loading products">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="overflow-hidden rounded-lg border">
          <Skeleton className="aspect-square w-full rounded-none" />
          <div className="grid gap-2 p-3 sm:p-4">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="mt-2 h-9 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
