"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState, PageSpinner } from "@/components/shared/state-views";
import { readLastOrder } from "@/lib/order-storage";
import { formatDate, formatPrice } from "@/lib/utils";
import type { SimulatedOrder } from "@/types";

export function OrderConfirmation() {
  const [order, setOrder] = useState<SimulatedOrder | null | undefined>(undefined);
  useEffect(() => setOrder(readLastOrder()), []);

  if (order === undefined) return <PageSpinner />;

  if (order === null) {
    return (
      <EmptyState
        title="No recent order"
        message="There is no simulated order to show in this session."
        action={{ label: "Continue shopping", href: "/products" }}
      />
    );
  }

  return (
    <div className="mx-auto grid max-w-2xl gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <CheckCircle2 className="size-10 text-success" aria-hidden="true" />
        <h1 className="text-2xl font-semibold sm:text-3xl">Simulated order placed</h1>
        <p className="text-muted-foreground">
          Reference <span className="font-mono">{order.reference}</span> · {formatDate(order.placedAt)}
        </p>
      </div>

      <Alert>
        <AlertDescription>
          This is a demonstration. No payment was processed, nothing will be shipped, and no order was
          sent to a server.
        </AlertDescription>
      </Alert>

      <Card>
        <CardContent className="grid gap-4 p-4 sm:p-6">
          <h2 className="font-semibold">Items</h2>
          <ul className="grid gap-2 text-sm">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between gap-3">
                <span className="min-w-0 truncate">
                  {item.title} <span className="text-muted-foreground">× {item.quantity}</span>
                </span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between border-t pt-3 font-semibold">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
          <div className="border-t pt-3 text-sm">
            <h2 className="mb-1 font-semibold">Delivery details entered</h2>
            <p>{order.customer.fullName}</p>
            <p className="text-muted-foreground">
              {order.customer.address}, {order.customer.city}
            </p>
            <p className="text-muted-foreground">
              {order.customer.email} · {order.customer.phone}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button asChild size="lg">
          <Link href="/products">Continue shopping</Link>
        </Button>
      </div>
    </div>
  );
}
