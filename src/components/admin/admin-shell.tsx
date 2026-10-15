"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useAuth } from "@/providers/auth-provider";
import { AdminNav } from "./admin-nav";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { logout, user } = useAuth();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col gap-4 border-r p-4 lg:flex">
        <Link href="/admin" className="px-3 text-lg font-semibold tracking-tight">
          Shop admin
        </Link>
        <AdminNav onLogout={handleLogout} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur">
          {/* Mobile / tablet drawer */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open admin menu">
                <Menu aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetTitle>Shop admin</SheetTitle>
              <AdminNav onNavigate={() => setOpen(false)} onLogout={handleLogout} />
            </SheetContent>
          </Sheet>
          <span className="font-semibold lg:hidden">Shop admin</span>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden max-w-48 truncate text-sm text-muted-foreground sm:inline">{user?.email}</span>
            <ThemeToggle />
          </div>
        </header>

        <main id="main-content" className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6">
          {children}
        </main>
      </div>
    </div>
  );
}
