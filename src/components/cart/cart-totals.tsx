import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";

interface CartTotalsProps {
  itemCount: number;
  subtotal: number;
  total: number;
}

export function CartTotals({ itemCount, subtotal, total }: CartTotalsProps) {
  return (
    <dl className="grid gap-2 text-sm">
      <div className="flex justify-between">
        <dt className="text-muted-foreground">Items</dt>
        <dd>{itemCount}</dd>
      </div>
      <div className="flex justify-between">
        <dt className="text-muted-foreground">Subtotal</dt>
        <dd>{formatPrice(subtotal)}</dd>
      </div>
      <Separator className="my-1" />
      <div className="flex justify-between text-base font-semibold">
        <dt>Total</dt>
        <dd>{formatPrice(total)}</dd>
      </div>
      <p className="text-xs text-muted-foreground">Shipping and taxes are not calculated in this demo.</p>
    </dl>
  );
}
