"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CartTotals } from "@/components/cart/cart-totals";
import { Field, fieldProps } from "@/components/shared/field";
import { EmptyState, PageSpinner } from "@/components/shared/state-views";
import { SafeImage } from "@/components/shared/safe-image";
import { ORDER_STORAGE_KEY } from "@/lib/order-storage";
import { formatPrice } from "@/lib/utils";
import { hasErrors, validateCheckout, type FieldErrors } from "@/lib/validators";
import { useAuth } from "@/providers/auth-provider";
import { useCart } from "@/providers/cart-provider";
import type { CheckoutFormData, SimulatedOrder } from "@/types";

export function CheckoutForm() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, hydrated, itemCount, subtotal, total, clear } = useCart();

  const [values, setValues] = useState<CheckoutFormData>({
    fullName: user?.name ?? "",
    email: user?.email ?? "",
    phone: "",
    address: "",
    city: "",
  });
  const [errors, setErrors] = useState<FieldErrors<keyof CheckoutFormData>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const completed = useRef(false); // avoids flashing the "empty cart" state after clear()

  if (!hydrated) return <PageSpinner label="Loading your cart…" />;

  if (items.length === 0 && !completed.current) {
    return (
      <EmptyState
        title="Your cart is empty"
        message="Add something to your cart before checking out."
        action={{ label: "Browse products", href: "/products" }}
      />
    );
  }

  const set = (key: keyof CheckoutFormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setFormError(null);

    const found = validateCheckout(values);
    setErrors(found);
    if (hasErrors(found)) return;

    setSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const order: SimulatedOrder = {
        reference: `SIM-${Date.now().toString(36).toUpperCase()}`,
        placedAt: new Date().toISOString(),
        customer: values,
        items,
        total,
      };
      sessionStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(order));
      completed.current = true;
      clear();
      router.push("/checkout/success");
    } catch {
      setFormError("We could not complete the simulated checkout. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_24rem]">
      <Card>
        <CardHeader>
          <CardTitle>Delivery information</CardTitle>
          <CardDescription>This is a demo checkout. No payment is taken and no order is placed.</CardDescription>
        </CardHeader>
        <CardContent>
          {formError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}
          <form id="checkout-form" onSubmit={onSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field id="fullName" label="Full name" error={errors.fullName}>
                <Input {...fieldProps("fullName", errors.fullName)} autoComplete="name" value={values.fullName} onChange={set("fullName")} />
              </Field>
            </div>
            <Field id="email" label="Email" error={errors.email}>
              <Input {...fieldProps("email", errors.email)} type="email" autoComplete="email" value={values.email} onChange={set("email")} />
            </Field>
            <Field id="phone" label="Phone number" error={errors.phone}>
              <Input {...fieldProps("phone", errors.phone)} type="tel" autoComplete="tel" value={values.phone} onChange={set("phone")} />
            </Field>
            <div className="sm:col-span-2">
              <Field id="address" label="Delivery address" error={errors.address}>
                <Input {...fieldProps("address", errors.address)} autoComplete="street-address" value={values.address} onChange={set("address")} />
              </Field>
            </div>
            <Field id="city" label="City" error={errors.city}>
              <Input {...fieldProps("city", errors.city)} autoComplete="address-level2" value={values.city} onChange={set("city")} />
            </Field>
          </form>
        </CardContent>
      </Card>

      <aside aria-label="Order summary">
        <Card className="lg:sticky lg:top-24">
          <CardHeader>
            <CardTitle>Order summary</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <ul className="grid gap-3">
              {items.map((item) => (
                <li key={item.id} className="flex items-center gap-3 text-sm">
                  <SafeImage src={item.image} alt="" className="size-12 shrink-0 rounded-md" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{item.title}</p>
                    <p className="text-muted-foreground">Qty {item.quantity}</p>
                  </div>
                  <p>{formatPrice(item.price * item.quantity)}</p>
                </li>
              ))}
            </ul>
            <CartTotals itemCount={itemCount} subtotal={subtotal} total={total} />
            <Button type="submit" form="checkout-form" size="lg" disabled={submitting}>
              {submitting ? "Placing order…" : "Place order"}
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/cart">Back to cart</Link>
            </Button>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
