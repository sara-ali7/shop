"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/shared/state-views";
import { PageHeader } from "@/components/shared/page-header";
import { SafeImage } from "@/components/shared/safe-image";
import { useAsync } from "@/hooks/use-async";
import { getCategories, getCategory } from "@/lib/api/categories";
import { getErrorMessage, isMissingRecord } from "@/lib/api/client";
import { formatDate } from "@/lib/utils";
import { CategoryForm } from "./category-form";

export function AdminCategoriesList() {
  const { data, error, loading, reload } = useAsync(getCategories, []);

  return (
    <>
      <PageHeader
        title="Categories"
        description="Each category links to its storefront page."
        actions={
          <Button asChild>
            <Link href="/admin/categories/new">
              <Plus aria-hidden="true" /> New category
            </Link>
          </Button>
        }
      />
      {loading && (
        <div role="status" aria-label="Loading categories" className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      )}
      {error && <ErrorState title="Could not load categories" message={getErrorMessage(error)} onRetry={reload} />}
      {!loading && !error && data?.length === 0 && (
        <EmptyState title="No categories yet" action={{ label: "Create a category", href: "/admin/categories/new" }} />
      )}
      {data && data.length > 0 && (
        <ul className="grid gap-3 sm:grid-cols-2">
          {data.map((c) => (
            <li key={c.id}>
              <Card className="flex gap-3 p-3">
                <SafeImage src={c.image} alt="" className="size-20 shrink-0 rounded-md" />
                <div className="flex min-w-0 flex-1 flex-col">
                  <h2 className="truncate font-medium">{c.name}</h2>
                  <p className="truncate text-xs text-muted-foreground">
                    ID {c.id} · /{c.slug || "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">Created {formatDate(c.creationAt)}</p>
                  <div className="mt-auto flex gap-2 pt-2">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/admin/categories/${c.id}/edit`} aria-label={`Edit ${c.name}`}>Edit</Link>
                    </Button>
                    {c.slug && (
                      <Button asChild size="sm" variant="ghost">
                        <Link href={`/categories/${c.slug}`} aria-label={`View ${c.name} in store`}>View</Link>
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export function AdminCategoryEdit({ id }: { id: string }) {
  const valid = /^\d+$/.test(id);
  const { data, error, loading, reload } = useAsync(() => getCategory(id), [id], valid);

  if (!valid || (error && isMissingRecord(error))) {
    return (
      <EmptyState title="Category not found" message="It may have been removed from the shared API." action={{ label: "Back to categories", href: "/admin/categories" }} />
    );
  }
  if (loading) {
    return (
      <div role="status" aria-label="Loading category" className="grid gap-3">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }
  if (error || !data) return <ErrorState title="Could not load category" message={getErrorMessage(error)} onRetry={reload} />;

  return (
    <>
      <PageHeader title={`Edit: ${data.name}`} description={`Category #${data.id} · created ${formatDate(data.creationAt)} · updated ${formatDate(data.updatedAt)}`} />
      <CategoryForm category={data} />
    </>
  );
}
