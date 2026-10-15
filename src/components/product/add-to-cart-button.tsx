"use client";

import { useEffect, useState } from "react";
import { Check, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/providers/cart-provider";
import type { Product } from "@/types";

interface AddToCartButtonProps {
  product: Product;
  quantity?: number;
  className?: string;
  size?: "default" | "sm" | "lg";
}

export function AddToCartButton({ product, quantity = 1, className, size = "sm" }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;
    const timer = setTimeout(() => setAdded(false), 1500);
    return () => clearTimeout(timer);
  }, [added]);

  return (
    <>
      <Button
        className={className}
        size={size}
        onClick={() => {
          addItem(product, quantity);
          setAdded(true);
        }}
      >
        {added ? <Check aria-hidden="true" /> : <ShoppingCart aria-hidden="true" />}
        {added ? "Added" : "Add to cart"}
      </Button>
      <span className="sr-only" role="status">
        {added ? `${product.title} added to cart` : ""}
      </span>
    </>
  );
}
