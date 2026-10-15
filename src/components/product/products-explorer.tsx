"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { ErrorState, EmptyState } from "@/components/shared/state-views";
import { useAsync } from "@/hooks/use-async";
import { getCategories } from "@/lib/api/categories";
import { getErrorMessage } from "@/lib/api/client";
import { getProducts } from "@/lib/api/products";
import type { ProductSort } from "@/types";
import { ProductGrid, ProductGridSkeleton } from "./product-grid";

const PAGE_SIZE = 12;

const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name-asc", label: "Name: A to Z" },
  { value: "name-desc", label: "Name: Z to A" },
];

const time = (iso: string) => {
  const t = Date.parse(iso);
  return Number.isNaN(t) ? 0 : t;
};

export function ProductsExplorer() {
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("search") ?? searchParams.get("q") ?? "";
  const urlCategory = searchParams.get("category") ?? searchParams.get("categoryId") ?? "all";

  const products = useAsync(getProducts, []);
  const categories = useAsync(getCategories, []);

  const [search, setSearch] = useState(urlSearch);
  const [categoryId, setCategoryId] = useState(urlCategory);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState<ProductSort>("newest");
  const [visible, setVisible] = useState(PAGE_SIZE);

  useEffect(() => {
    setSearch(urlSearch);
    setCategoryId(urlCategory);
    setVisible(PAGE_SIZE);
  }, [urlSearch, urlCategory]);

  const min = minPrice.trim() === "" ? null : Number(minPrice);
  const max = maxPrice.trim() === "" ? null : Number(maxPrice);
  const rangeInvalid = min !== null && max !== null && min > max;

  const results = useMemo(() => {
    const term = search.trim().toLowerCase();
    const list = (products.data ?? []).filter((p) => {
      if (term) {
        const inTitle = p.title.toLowerCase().includes(term);
        const inCategory = p.category.name.toLowerCase().includes(term);
        const inDescription = p.description.toLowerCase().includes(term);
        if (!inTitle && !inCategory && !inDescription) return false;
      }
      if (categoryId !== "all") {
        const matchesId = String(p.category.id) === categoryId;
        const matchesSlug = p.category.slug.toLowerCase() === categoryId.toLowerCase();
        const matchesName = p.category.name.toLowerCase() === categoryId.toLowerCase();
        if (!matchesId && !matchesSlug && !matchesName) return false;
      }
      if (min !== null && Number.isFinite(min) && p.price < min) return false;
      if (max !== null && Number.isFinite(max) && p.price > max) return false;
      return true;
    });
    const sorted = [...list];
    switch (sort) {
      case "newest":
        sorted.sort((a, b) => time(b.creationAt) - time(a.creationAt));
        break;
      case "oldest":
        sorted.sort((a, b) => time(a.creationAt) - time(b.creationAt));
        break;
      case "price-asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "name-desc":
        sorted.sort((a, b) => b.title.localeCompare(a.title));
        break;
    }
    return rangeInvalid ? [] : sorted;
  }, [products.data, search, categoryId, min, max, sort, rangeInvalid]);

  const update = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value);
    setVisible(PAGE_SIZE);
  };

  const hasFilters = search !== "" || categoryId !== "all" || minPrice !== "" || maxPrice !== "";
  const reset = () => {
    setSearch("");
    setCategoryId("all");
    setMinPrice("");
    setMaxPrice("");
    setSort("newest");
    setVisible(PAGE_SIZE);
  };

  return (
    <div>
      <form
        role="search"
        aria-label="Filter products"
        onSubmit={(e) => e.preventDefault()}
        className="mb-6 grid gap-3 rounded-lg border p-3 sm:grid-cols-2 sm:p-4 lg:grid-cols-6"
      >
        <div className="grid gap-1.5 sm:col-span-2">
          <Label htmlFor="search">Search by name</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              id="search"
              type="search"
              placeholder="Search products…"
              className="pl-9"
              value={search}
              onChange={(e) => update(setSearch)(e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="category">Category</Label>
          <Select id="category" value={categoryId} onChange={(e) => update(setCategoryId)(e.target.value)}>
            <option value="all">All categories</option>
            {(categories.data ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:col-span-2 lg:col-span-1">
          <div className="grid gap-1.5">
            <Label htmlFor="min-price">Min price</Label>
            <Input
              id="min-price"
              type="number"
              inputMode="decimal"
              min={0}
              placeholder="0"
              value={minPrice}
              aria-invalid={rangeInvalid || undefined}
              onChange={(e) => update(setMinPrice)(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="max-price">Max price</Label>
            <Input
              id="max-price"
              type="number"
              inputMode="decimal"
              min={0}
              placeholder="Any"
              value={maxPrice}
              aria-invalid={rangeInvalid || undefined}
              onChange={(e) => update(setMaxPrice)(e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="sort">Sort by</Label>
          <Select id="sort" value={sort} onChange={(e) => update(setSort)(e.target.value as ProductSort)}>
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </div>

        {rangeInvalid && (
          <p className="text-sm text-destructive sm:col-span-2 lg:col-span-6" role="alert">
            The minimum price is higher than the maximum price.
          </p>
        )}
      </form>

      {products.loading && <ProductGridSkeleton count={8} />}

      {products.error && (
        <ErrorState
          title="Could not load products"
          message={getErrorMessage(products.error)}
          onRetry={products.reload}
        />
      )}

      {!products.loading && !products.error && (products.data?.length ?? 0) === 0 && (
        <EmptyState title="No products available" message="The store has no products right now. Please check back later." />
      )}

      {!products.loading && !products.error && (products.data?.length ?? 0) > 0 && (
        <>
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {results.length} {results.length === 1 ? "product" : "products"}
            </p>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={reset}>
                Reset filters
              </Button>
            )}
          </div>

          {results.length === 0 ? (
            <EmptyState
              title="No products match your filters"
              message="Try a different search term, category or price range."
              action={{ label: "Reset filters", onClick: reset }}
            />
          ) : (
            <>
              <ProductGrid products={results.slice(0, visible)} />
              {visible < results.length && (
                <div className="mt-6 flex justify-center">
                  <Button variant="outline" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                    Show more ({results.length - visible} remaining)
                  </Button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
