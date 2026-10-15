import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { Container } from "./container";

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/20">
      <Container className="flex flex-col gap-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <Logo size="sm" />
          <p className="text-xs">© {new Date().getFullYear()} BE-xpert. Quality goods, simply organised.</p>
        </div>
        <nav aria-label="Footer" className="flex gap-4">
          <Link href="/products" className="hover:text-foreground">Products</Link>
          <Link href="/categories" className="hover:text-foreground">Categories</Link>
          <Link href="/cart" className="hover:text-foreground">Cart</Link>
        </nav>
        <p className="text-xs">Data from the public EscuelaJS API. Orders are simulated.</p>
      </Container>
    </footer>
  );
}
