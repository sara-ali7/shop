"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageSpinner } from "@/components/shared/state-views";
import { loginUrl } from "@/lib/routes";
import { useAuth } from "@/providers/auth-provider";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { status, isAdmin, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") router.replace(loginUrl(pathname, "admin"));
  }, [status, pathname, router]);

  if (status !== "authenticated") {
    return <PageSpinner label={status === "loading" ? "Checking your session…" : "Redirecting to log in…"} />;
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center gap-3 px-4 text-center">
        <ShieldAlert className="size-10 text-destructive" aria-hidden="true" />
        <h1 className="text-2xl font-semibold">Admin access required</h1>
        <p className="text-muted-foreground">
          {user?.email} does not have an administrator role, so the dashboard is hidden. Log in with an
          admin account to continue.
        </p>
        <Button asChild>
          <Link href="/">Back to store</Link>
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
