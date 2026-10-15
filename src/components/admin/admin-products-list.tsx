"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState, ErrorState } from "@/components/shared/state-views";
import { Pagination } from "@/components/shared/pagination";
import { PageHeader } from "@/components/shared/page-header";
import { SafeImage } from "@/components/shared/safe-image";
import { Skeleton } from "@/components/ui/skeleton";
import { useAsync } from "@/hooks/use-async";
import { getErrorMessage } from "@/lib/api/client";
import { getProducts } from "@/lib/api/products";
import { formatDate, formatPrice } from "@/lib/utils";

const PAGE_SIZE = 10;

export function AdminProductsList() {
  const { data, error, loading, reload } = useAsync(getProducts, []);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => setPage(1), [search]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const list = [...(data ?? [])].sort((a, b) => b.id - a.id);
    if (!term) return list;
    return list.filter(
      (p) =>
        p.title.toLowerCase().includes(term) ||
        p.category.name.toLowerCase().includes(term) ||
        String(p.id) === term,
    );
  }, [data, search]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      <PageHeader
        title="Products"
        description="Search, inspect, create and edit products."
        actions={
          <Button asChild>
            <Link href="/admin/products/new">
              <Plus aria-hidden="true" /> New product
            </Link>
          </Button>
        }
      />

      <div className="mb-4 grid max-w-sm gap-1.5">
        <Label htmlFor="admin-product-search">Search products</Label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input id="admin-product-search" type="search" className="pl-9" placeholder="Title, category or ID" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {loading && (
        <div role="status" aria-label="Loading products" className="grid gap-2">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      )}
      {error && <ErrorState title="Could not load products" message={getErrorMessage(error)} onRetry={reload} />}
      {!loading && !error && filtered.length === 0 && (
        <EmptyState
          title={search ? "No products match your search" : "No products yet"}
          action={search ? { label: "Clear search", onClick: () => setSearch("") } : { label: "Create a product", href: "/admin/products/new" }}
        />
      )}

      {!loading && !error && filtered.length > 0 && (
        <>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Products</caption>
              <thead className="border-b bg-muted/50 text-muted-foreground">
                <tr>
                  <th scope="col" className="px-3 py-2 font-medium">Product</th>
                  <th scope="col" className="hidden px-3 py-2 font-medium md:table-cell">Category</th>
                  <th scope="col" className="px-3 py-2 font-medium">Price</th>
                  <th scope="col" className="hidden px-3 py-2 font-medium lg:table-cell">Created</th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-3">
                        <SafeImage src={p.images[0]} alt="" className="size-10 shrink-0 rounded-md" />
                        <div className="min-w-0">
                          <Link href={`/admin/products/${p.id}`} className="block max-w-40 truncate font-medium hover:underline sm:max-w-xs">
                            {p.title}
                          </Link>
                          <span className="text-xs text-muted-foreground">ID {p.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-3 py-2 md:table-cell">{p.category.name}</td>
                    <td className="px-3 py-2 tabular-nums">{formatPrice(p.price)}</td>
                    <td className="hidden px-3 py-2 lg:table-cell">{formatDate(p.creationAt)}</td>
                    <td className="px-3 py-2">
                      <div className="flex justify-end gap-1">
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/admin/products/${p.id}`} aria-label={`View ${p.title}`}>View</Link>
                        </Button>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/products/${p.id}/edit`} aria-label={`Edit ${p.title}`}>Edit</Link>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} pageCount={pageCount} onChange={setPage} />
        </>
      )}
    </>
  );
}
