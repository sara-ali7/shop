"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, FolderTree, LayoutDashboard, LogOut, Package, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/users", label: "Users", icon: Users },
];

const linkClass =
  "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-4";

interface AdminNavProps {
  onNavigate?: () => void;
  onLogout: () => void;
}

export function AdminNav({ onNavigate, onLogout }: AdminNavProps) {
  const pathname = usePathname();
  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav aria-label="Admin" className="flex flex-1 flex-col gap-1">
      {ITEMS.map(({ href, label, icon: Icon, exact }) => (
        <Link
          key={href}
          href={href}
          onClick={onNavigate}
          aria-current={isActive(href, exact) ? "page" : undefined}
          className={cn(linkClass, isActive(href, exact) && "bg-accent")}
        >
          <Icon aria-hidden="true" />
          {label}
        </Link>
      ))}
      <div className="mt-auto grid gap-1 border-t pt-2">
        <Link href="/" onClick={onNavigate} className={linkClass}>
          <ArrowLeft aria-hidden="true" />
          Back to store
        </Link>
        <button
          type="button"
          onClick={() => {
            onNavigate?.();
            onLogout();
          }}
          className={cn(linkClass, "text-left")}
        >
          <LogOut aria-hidden="true" />
          Log out
        </button>
      </div>
    </nav>
  );
}
