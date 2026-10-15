"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/state-views";
import { SafeImage } from "@/components/shared/safe-image";
import { loginUrl } from "@/lib/routes";
import { formatPrice } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import { useCart } from "@/providers/cart-provider";
import { CartTotals } from "./cart-totals";

export function CartView() {
  const router = useRouter();
  const { status } = useAuth();
  const { items, hydrated, itemCount, subtotal, total, increase, decrease, remove, clear } = useCart();

  if (!hydrated) {
    return (
      <div role="status" aria-label="Loading cart" className="grid gap-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="Your cart is empty"
        message="Add a few products and they will show up here."
        action={{ label: "Continue shopping", href: "/products" }}
      />
    );
  }

  const checkout = () => {
    if (status === "authenticated") router.push("/checkout");
    else router.push(loginUrl("/checkout", "checkout"));
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
      <ul className="grid gap-3">
        {items.map((item) => (
          <li key={item.id}>
            <Card className="flex gap-3 p-3 sm:gap-4 sm:p-4">
              <SafeImage src={item.image} alt={item.title} className="size-20 shrink-0 rounded-md sm:size-24" />
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/products/${item.id}`} className="line-clamp-2 font-medium hover:underline">
                    {item.title}
                  </Link>
                  <Button variant="ghost" size="icon" className="-mr-2 -mt-2 shrink-0" onClick={() => remove(item.id)} aria-label={`Remove ${item.title} from cart`}>
                    <Trash2 aria-hidden="true" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">{formatPrice(item.price)} each</p>
                <div className="mt-auto flex items-center justify-between gap-2">
                  <div role="group" aria-label={`Quantity for ${item.title}`} className="flex items-center rounded-md border">
                    <Button variant="ghost" size="sm" className="px-2" onClick={() => decrease(item.id)} disabled={item.quantity <= 1} aria-label="Decrease quantity">
                      <Minus aria-hidden="true" />
                    </Button>
                    <output className="w-8 text-center text-sm tabular-nums" aria-live="polite">
                      {item.quantity}
                    </output>
                    <Button variant="ghost" size="sm" className="px-2" onClick={() => increase(item.id)} disabled={item.quantity >= 99} aria-label="Increase quantity">
                      <Plus aria-hidden="true" />
                    </Button>
                  </div>
                  <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                </div>
              </div>
            </Card>
          </li>
        ))}
      </ul>

      <aside aria-label="Order summary">
        <Card className="lg:sticky lg:top-24">
          <CardHeader>
            <CardTitle>Order summary</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <CartTotals itemCount={itemCount} subtotal={subtotal} total={total} />
            <Button size="lg" onClick={checkout} disabled={status === "loading"}>
              Proceed to checkout
            </Button>
            <Button variant="outline" asChild>
              <Link href="/products">Continue shopping</Link>
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                if (window.confirm("Remove every item from your cart?")) clear();
              }}
            >
              Clear cart
            </Button>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
