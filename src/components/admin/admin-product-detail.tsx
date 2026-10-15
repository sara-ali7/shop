"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/shared/state-views";
import { PageHeader } from "@/components/shared/page-header";
import { SafeImage } from "@/components/shared/safe-image";
import { useAsync } from "@/hooks/use-async";
import { getErrorMessage, isMissingRecord } from "@/lib/api/client";
import { getProduct } from "@/lib/api/products";
import { formatDate, formatPrice } from "@/lib/utils";
import { ProductForm } from "./product-form";

function useProductById(id: string) {
  return useAsync(() => getProduct(id), [id], /^\d+$/.test(id));
}

function ProductState({ id, children }: { id: string; children: (p: NonNullable<ReturnType<typeof useProductById>["data"]>) => React.ReactNode }) {
  const { data, error, loading, reload } = useProductById(id);
  if (!/^\d+$/.test(id)) return <MissingProduct />;
  if (loading)
    return (
      <div role="status" aria-label="Loading product" className="grid gap-3">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  if (error && isMissingRecord(error)) return <MissingProduct />;
  if (error || !data) return <ErrorState title="Could not load product" message={getErrorMessage(error)} onRetry={reload} />;
  return <>{children(data)}</>;
}

function MissingProduct() {
  return (
    <EmptyState
      title="Product not found"
      message="It may have been removed from the shared API."
      action={{ label: "Back to products", href: "/admin/products" }}
    />
  );
}

export function AdminProductDetail({ id }: { id: string }) {
  const [active, setActive] = useState(0);
  return (
    <ProductState id={id}>
      {(p) => (
        <>
          <PageHeader
            title={p.title}
            description={`Product #${p.id}`}
            actions={
              <>
                <Button asChild variant="outline"><Link href="/admin/products">Back</Link></Button>
                <Button asChild variant="outline"><Link href={`/products/${p.id}`}>View in store</Link></Button>
                <Button asChild><Link href={`/admin/products/${p.id}/edit`}>Edit</Link></Button>
              </>
            }
          />
          <Card>
            <CardContent className="grid gap-6 p-4 sm:p-6 md:grid-cols-2">
              <div className="grid gap-2">
                <SafeImage src={p.images[active]} alt={p.title} className="aspect-square w-full rounded-md" />
                {p.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto">
                    {p.images.map((src, i) => (
                      <button key={src + i} type="button" onClick={() => setActive(i)} aria-label={`Show image ${i + 1}`} aria-pressed={i === active} className="shrink-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        <SafeImage src={src} alt="" className="size-14 rounded-md" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <dl className="grid content-start gap-3 text-sm">
                <div><dt className="text-muted-foreground">Price</dt><dd className="text-lg font-semibold">{formatPrice(p.price)}</dd></div>
                <div><dt className="text-muted-foreground">Category</dt><dd>{p.category.name}</dd></div>
                <div><dt className="text-muted-foreground">Description</dt><dd className="whitespace-pre-line">{p.description || "—"}</dd></div>
                <div><dt className="text-muted-foreground">Slug</dt><dd className="break-all font-mono text-xs">{p.slug || "—"}</dd></div>
                <div><dt className="text-muted-foreground">Created</dt><dd>{formatDate(p.creationAt)}</dd></div>
                <div><dt className="text-muted-foreground">Last updated</dt><dd>{formatDate(p.updatedAt)}</dd></div>
              </dl>
            </CardContent>
          </Card>
        </>
      )}
    </ProductState>
  );
}

export function AdminProductEdit({ id }: { id: string }) {
  return (
    <ProductState id={id}>
      {(p) => (
        <>
          <PageHeader title={`Edit: ${p.title}`} description={`Product #${p.id}`} />
          <ProductForm product={p} />
        </>
      )}
    </ProductState>
  );
}
