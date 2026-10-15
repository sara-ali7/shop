"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/state-views";
import { SafeImage } from "@/components/shared/safe-image";
import { PageHeader } from "@/components/shared/page-header";
import { useAsync } from "@/hooks/use-async";
import { getCategories } from "@/lib/api/categories";
import { getErrorMessage } from "@/lib/api/client";
import { getProducts } from "@/lib/api/products";
import { getUsers } from "@/lib/api/users";
import { formatDate, formatPrice } from "@/lib/utils";
import { StatCard } from "./stat-card";

export function AdminOverview() {
  const products = useAsync(getProducts, []);
  const categories = useAsync(getCategories, []);
  const users = useAsync(getUsers, []);

  const recent = [...(products.data ?? [])]
    .sort((a, b) => Date.parse(b.creationAt) - Date.parse(a.creationAt))
    .slice(0, 5);

  return (
    <>
      <PageHeader title="Overview" description="Live counts from the EscuelaJS API." />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total products" href="/admin/products" loading={products.loading} value={products.error ? null : (products.data?.length ?? null)} error={products.error ? getErrorMessage(products.error) : null} />
        <StatCard label="Total categories" href="/admin/categories" loading={categories.loading} value={categories.error ? null : (categories.data?.length ?? null)} error={categories.error ? getErrorMessage(categories.error) : null} />
        <StatCard label="Total users" href="/admin/users" loading={users.loading} value={users.error ? null : (users.data?.length ?? null)} error={users.error ? getErrorMessage(users.error) : null} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_16rem]">
        <Card>
          <CardHeader>
            <CardTitle>Recently available products</CardTitle>
          </CardHeader>
          <CardContent>
            {products.loading && (
              <div role="status" aria-label="Loading products" className="grid gap-3">
                {Array.from({ length: 4 }, (_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            )}
            {products.error && <ErrorState title="Could not load products" message={getErrorMessage(products.error)} onRetry={products.reload} />}
            {!products.loading && !products.error && recent.length === 0 && (
              <p className="text-sm text-muted-foreground">No products found.</p>
            )}
            {recent.length > 0 && (
              <ul className="grid gap-3">
                {recent.map((p) => (
                  <li key={p.id} className="flex items-center gap-3">
                    <SafeImage src={p.images[0]} alt="" className="size-12 shrink-0 rounded-md" />
                    <div className="min-w-0 flex-1">
                      <Link href={`/admin/products/${p.id}`} className="block truncate font-medium hover:underline">
                        {p.title}
                      </Link>
                      <p className="text-xs text-muted-foreground">Added {formatDate(p.creationAt)}</p>
                    </div>
                    <span className="text-sm">{formatPrice(p.price)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Quick links</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button asChild variant="outline"><Link href="/admin/products/new">New product</Link></Button>
            <Button asChild variant="outline"><Link href="/admin/categories/new">New category</Link></Button>
            <Button asChild variant="outline"><Link href="/admin/products">All products</Link></Button>
            <Button asChild variant="outline"><Link href="/admin/users">All users</Link></Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
