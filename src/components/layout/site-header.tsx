"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LogIn, LogOut, Menu, ShoppingCart, UserRound } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import { useCart } from "@/providers/cart-provider";
import { Logo } from "@/components/shared/logo";
import { Container } from "./container";
import { NavSearch } from "./nav-search";
import { ThemeToggle } from "./theme-toggle";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/categories", label: "Categories" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { user, status, isAdmin, logout } = useAuth();
  const { itemCount, hydrated } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="relative z-40 border-b bg-background">
      <Container className="flex h-16 items-center gap-2">
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
              <Menu aria-hidden="true" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetTitle>
              <Logo href="/" size="sm" />
            </SheetTitle>
            <nav aria-label="Mobile" className="flex flex-col gap-1">
              {NAV.map((item) => (
                <SheetClose asChild key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={cn(
                      "rounded-md px-3 py-2 text-sm font-medium hover:bg-accent",
                      isActive(item.href) && "bg-accent",
                    )}
                  >
                    {item.label}
                  </Link>
                </SheetClose>
              ))}
              <div className="my-2 h-px bg-border" />
              {user ? (
                <>
                  <SheetClose asChild>
                    <Link href="/profile" className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent">
                      Profile
                    </Link>
                  </SheetClose>
                  {isAdmin && (
                    <SheetClose asChild>
                      <Link href="/admin" className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent">
                        Admin dashboard
                      </Link>
                    </SheetClose>
                  )}
                  <SheetClose asChild>
                    <button
                      onClick={logout}
                      className="rounded-md px-3 py-2 text-left text-sm font-medium hover:bg-accent"
                    >
                      Log out
                    </button>
                  </SheetClose>
                </>
              ) : (
                <>
                  <SheetClose asChild>
                    <Link href="/login" className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent">
                      Log in
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link href="/register" className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent">
                      Create account
                    </Link>
                  </SheetClose>
                </>
              )}
            </nav>
          </SheetContent>
        </Sheet>

        <Logo href="/" className="mr-3" />

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex shrink-0">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground",
                isActive(item.href) && "text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mx-2 hidden min-w-0 flex-1 md:flex">
          <NavSearch />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1">
          <ThemeToggle />

          <Button variant="ghost" size="icon" asChild className="relative">
            <Link href="/cart" aria-label={hydrated ? `Cart, ${itemCount} items` : "Cart"}>
              <ShoppingCart aria-hidden="true" />
              {hydrated && itemCount > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-medium text-primary-foreground"
                >
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </Link>
          </Button>

          {status === "loading" ? (
            <span className="size-10" aria-hidden="true" />
          ) : user ? (
            <>
              {isAdmin && (
                <Button variant="ghost" size="icon" asChild className="hidden md:inline-flex">
                  <Link href="/admin" aria-label="Admin dashboard">
                    <LayoutDashboard aria-hidden="true" />
                  </Link>
                </Button>
              )}
              <Button variant="ghost" asChild className="hidden gap-2 px-2 md:inline-flex">
                <Link href="/profile" aria-label="Your profile">
                  <Avatar src={user.avatar} name={user.name} className="size-7 text-xs" />
                  <span className="max-w-28 truncate">{user.name || "Profile"}</span>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" onClick={logout} className="hidden md:inline-flex" aria-label="Log out">
                <LogOut aria-hidden="true" />
              </Button>
              <Button variant="ghost" size="icon" asChild className="md:hidden">
                <Link href="/profile" aria-label="Your profile">
                  <UserRound aria-hidden="true" />
                </Link>
              </Button>
            </>
          ) : (
            <Button variant="outline" asChild>
              <Link href="/login">
                <LogIn aria-hidden="true" />
                Log in
              </Link>
            </Button>
          )}
        </div>
      </Container>

      <div className="border-t px-4 py-2 md:hidden">
        <NavSearch compact />
      </div>
    </header>
  );
}
