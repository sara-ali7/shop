import Link from "next/link";
import { Card } from "@/components/ui/card";
import { SafeImage } from "@/components/shared/safe-image";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";
import { AddToCartButton } from "./add-to-cart-button";

export function ProductCard({ product }: { product: Product }) {
  const href = `/products/${product.id}`;
  return (
    <Card className="flex flex-col overflow-hidden">
      <Link href={href} tabIndex={-1} aria-hidden="true" className="block">
        <SafeImage src={product.images[0]} alt={product.title} className="aspect-square w-full" />
      </Link>
      <div className="flex flex-1 flex-col gap-1 p-3 sm:p-4">
        <p className="truncate text-xs text-muted-foreground">{product.category.name}</p>
        <h3 className="line-clamp-2 text-sm font-medium sm:text-base">
          <Link href={href} className="hover:underline focus-visible:underline">
            {product.title}
          </Link>
        </h3>
        <p className="mt-auto pt-2 font-semibold">{formatPrice(product.price)}</p>
      </div>
      <div className="p-3 pt-0 sm:p-4 sm:pt-0">
        <AddToCartButton product={product} className="w-full" />
      </div>
    </Card>
  );
}
