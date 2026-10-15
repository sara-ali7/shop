"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { PageSpinner } from "@/components/shared/state-views";
import { loginUrl, reasonForPath } from "@/lib/routes";
import { useAuth } from "@/providers/auth-provider";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(loginUrl(pathname, reasonForPath(pathname)));
    }
  }, [status, pathname, router]);

  if (status !== "authenticated") {
    return <PageSpinner label={status === "loading" ? "Checking your session…" : "Redirecting to log in…"} />;
  }
  return <>{children}</>;
}
