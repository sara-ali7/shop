"use client";

import { useState } from "react";
import Link from "next/link";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SafeImage } from "@/components/shared/safe-image";
import { cn, formatPrice } from "@/lib/utils";
import type { Product } from "@/types";
import { AddToCartButton } from "./add-to-cart-button";

const MAX_QTY = 99;

export function ProductDetail({ product }: { product: Product }) {
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const images = product.images;

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="grid gap-3">
        <SafeImage
          src={images[activeImage]}
          alt={product.title}
          className="aspect-square w-full rounded-lg border"
        />
        {images.length > 1 && (
          <ul className="flex gap-2 overflow-x-auto pb-1" aria-label="Product images">
            {images.map((src, index) => (
              <li key={src + index}>
                <button
                  type="button"
                  onClick={() => setActiveImage(index)}
                  aria-label={`Show image ${index + 1} of ${images.length}`}
                  aria-pressed={index === activeImage}
                  className={cn(
                    "block overflow-hidden rounded-md border-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    index === activeImage ? "border-primary" : "border-transparent",
                  )}
                >
                  <SafeImage src={src} alt="" className="size-16" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <div>
          {product.category.slug ? (
            <Link
              href={`/categories/${product.category.slug}`}
              className="text-sm text-muted-foreground hover:underline"
            >
              {product.category.name}
            </Link>
          ) : (
            <span className="text-sm text-muted-foreground">{product.category.name}</span>
          )}
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">{product.title}</h1>
        </div>

        <p className="text-2xl font-semibold">{formatPrice(product.price)}</p>

        <p className="max-w-prose whitespace-pre-line text-muted-foreground">
          {product.description || "No description available."}
        </p>

        <div className="mt-2 grid gap-3">
          <div className="flex items-center gap-3">
            <span id="qty-label" className="text-sm font-medium">
              Quantity
            </span>
            <div role="group" aria-labelledby="qty-label" className="flex items-center rounded-md border">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
              >
                <Minus aria-hidden="true" />
              </Button>
              <output aria-live="polite" className="w-10 text-center tabular-nums">
                {quantity}
              </output>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setQuantity((q) => Math.min(MAX_QTY, q + 1))}
                disabled={quantity >= MAX_QTY}
                aria-label="Increase quantity"
              >
                <Plus aria-hidden="true" />
              </Button>
            </div>
          </div>
          <AddToCartButton product={product} quantity={quantity} size="lg" className="w-full sm:w-auto sm:self-start" />
        </div>
      </div>
    </div>
  );
}
