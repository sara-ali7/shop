"use client";

import { Suspense, useEffect, useId, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, ChevronDown, Loader2, Search, Tag, X } from "lucide-react";
import { SafeImage } from "@/components/shared/safe-image";
import { getCategories } from "@/lib/api/categories";
import { searchProducts } from "@/lib/api/products";
import { cn, formatPrice } from "@/lib/utils";
import type { Category, Product } from "@/types";

interface NavSearchProps {
  className?: string;
  onSearchSubmit?: () => void;
  autoFocus?: boolean;
  compact?: boolean;
}

export function NavSearch(props: NavSearchProps) {
  return (
    <Suspense fallback={<NavSearchFallback compact={props.compact} className={props.className} />}>
      <NavSearchInner {...props} />
    </Suspense>
  );
}

function NavSearchFallback({ compact, className }: { compact?: boolean; className?: string }) {
  return (
    <div
      className={cn(
        "flex h-9 w-full items-center rounded-lg border border-input bg-muted/40",
        compact && "h-8",
        className,
      )}
      aria-hidden="true"
    />
  );
}

function NavSearchInner({ className, onSearchSubmit, autoFocus, compact }: NavSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const uid = useId();

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingCats, setLoadingCats] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const [search, setSearch] = useState(
    () => searchParams.get("search") ?? searchParams.get("q") ?? "",
  );
  const [categoryId, setCategoryId] = useState(
    () => searchParams.get("category") ?? searchParams.get("categoryId") ?? "all",
  );
  const [isOpen, setIsOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSearch(searchParams.get("search") ?? searchParams.get("q") ?? "");
    setCategoryId(searchParams.get("category") ?? searchParams.get("categoryId") ?? "all");
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    setLoadingCats(true);
    getCategories()
      .then((cats) => {
        if (!cancelled) setCategories(cats);
      })
      .catch(() => {
        if (!cancelled) setCategories([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingCats(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const term = search.trim();
    if (!isOpen || term.length < 2) {
      setProducts([]);
      setLoadingProducts(false);
      return;
    }

    let cancelled = false;
    setLoadingProducts(true);
    const timer = window.setTimeout(() => {
      searchProducts({ title: term, categoryId, limit: 6 })
        .then((list) => {
          if (!cancelled) setProducts(list);
        })
        .catch(() => {
          if (!cancelled) setProducts([]);
        })
        .finally(() => {
          if (!cancelled) setLoadingProducts(false);
        });
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [search, categoryId, isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const executeSearch = (overrideSearch?: string, overrideCategory?: string) => {
    const finalSearch = (overrideSearch !== undefined ? overrideSearch : search).trim();
    const finalCategory = overrideCategory !== undefined ? overrideCategory : categoryId;

    setIsOpen(false);
    inputRef.current?.blur();
    onSearchSubmit?.();

    const params = new URLSearchParams();
    if (finalSearch) params.set("search", finalSearch);
    if (finalCategory && finalCategory !== "all") params.set("category", finalCategory);

    const query = params.toString();
    startTransition(() => {
      router.push(query ? `/products?${query}` : "/products");
    });
  };

  const term = search.trim().toLowerCase();
  const matchingCategories = term
    ? categories.filter((c) => c.name.toLowerCase().includes(term)).slice(0, 6)
    : [];

  const selectedCategoryName =
    categoryId === "all"
      ? "All Categories"
      : categories.find((c) => String(c.id) === categoryId || c.slug === categoryId)?.name ||
        "Category";

  return (
    <div ref={containerRef} className={cn("relative w-full min-w-0", className)}>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          executeSearch();
        }}
        className={cn(
          "flex h-9 w-full min-w-0 items-center overflow-hidden rounded-lg border border-input bg-muted/40",
          "focus-within:border-primary focus-within:bg-background focus-within:ring-2 focus-within:ring-primary/20",
          compact && "h-8 text-xs",
        )}
      >
        <label className="relative flex h-full w-[6.75rem] shrink-0 items-center border-r border-input/60 sm:w-[8.25rem]">
          <select
            id={`${uid}-category`}
            aria-label="Search category"
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              inputRef.current?.focus();
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            className={cn(
              "h-full w-full cursor-pointer appearance-none truncate bg-transparent pl-2.5 pr-7 text-xs font-medium outline-none",
              compact && "pl-2 pr-6 text-[11px]",
            )}
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-1.5 size-3.5 text-muted-foreground"
            aria-hidden="true"
          />
        </label>
        <div className="relative flex min-w-0 flex-1 items-center">
          <input
            ref={inputRef}
            type="text"
            id={`${uid}-input`}
            autoFocus={autoFocus}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={
              categoryId !== "all" ? `Search in ${selectedCategoryName}…` : "Search products…"
            }
            autoComplete="off"
            spellCheck={false}
            className={cn(
              "h-9 min-w-0 w-full bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground",
              compact && "h-8 px-2 text-xs",
            )}
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                inputRef.current?.focus();
              }}
              className="mr-1 inline-flex size-6 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="size-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
        <button
          type="submit"
          aria-label="Search"
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary",
            compact && "h-8 w-8",
          )}
        >
          {loadingCats || loadingProducts ? (
            <Loader2 className="size-4 animate-spin text-primary" aria-hidden="true" />
          ) : (
            <Search className="size-4" aria-hidden="true" />
          )}
        </button>
      </form>
      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-[min(24rem,70vh)] overflow-y-auto rounded-lg border bg-popover text-popover-foreground shadow-xl">
          {term.length >= 2 ? (
            <div className="divide-y divide-border">
              {matchingCategories.length > 0 && (
                <div className="p-2">
                  <div className="mb-1.5 flex items-center gap-1.5 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <Tag className="size-3" aria-hidden="true" />
                    <span>Categories</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 px-1">
                    {matchingCategories.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => executeSearch("", String(c.id))}
                        className="inline-flex items-center gap-1 rounded-full border bg-muted/50 px-2.5 py-1 text-xs font-medium hover:border-primary hover:bg-primary/10 hover:text-primary"
                      >
                        <span>{c.name}</span>
                        <ArrowRight className="size-3 text-muted-foreground" aria-hidden="true" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {products.length > 0 ? (
                <div className="p-2">
                  <div className="mb-1.5 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Products
                  </div>
                  <div className="flex flex-col gap-1">
                    {products.map((p) => (
                      <Link
                        key={p.id}
                        href={`/products/${p.id}`}
                        onClick={() => {
                          setIsOpen(false);
                          onSearchSubmit?.();
                        }}
                        className="flex items-center gap-3 rounded-md p-1.5 hover:bg-accent"
                      >
                        <div className="size-10 shrink-0 overflow-hidden rounded border bg-muted">
                          <SafeImage src={p.images[0]} alt={p.title} className="size-full object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium sm:text-sm">{p.title}</p>
                          <p className="truncate text-xs text-muted-foreground">{p.category.name}</p>
                        </div>
                        <span className="shrink-0 text-xs font-semibold sm:text-sm">
                          {formatPrice(p.price)}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : loadingProducts ? (
                <div className="p-4 text-center text-xs text-muted-foreground">Searching…</div>
              ) : matchingCategories.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  <p>No results found for &ldquo;{search}&rdquo;</p>
                  <p className="mt-1 text-[11px]">Press Enter to search all products</p>
                </div>
              ) : null}
              <div className="bg-muted/30 p-2">
                <button
                  type="button"
                  onClick={() => executeSearch()}
                  className="flex w-full items-center justify-between rounded-md px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10"
                >
                  <span>View all results in {selectedCategoryName}</span>
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Popular Categories
              </div>
              <div className="flex flex-wrap gap-1.5">
                {categories.slice(0, 6).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => executeSearch("", String(c.id))}
                    className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-2.5 py-1 text-xs font-medium hover:border-primary hover:bg-primary/5 hover:text-primary"
                  >
                    <Tag className="size-3 text-muted-foreground" aria-hidden="true" />
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>
              <p className="mt-3 border-t pt-2 text-[11px] text-muted-foreground">
                Type at least 2 characters to search products.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
