import type { User } from "@/types";

export type AdminAccessMode = "api-role" | "dev-allowlist";

export function getAdminAccess(user: User | null): {
  allowed: boolean;
  mode: AdminAccessMode | null;
} {
  if (!user) return { allowed: false, mode: null };
  if (user.role === "admin") return { allowed: true, mode: "api-role" };

  const allowlist = (process.env.NEXT_PUBLIC_DEV_ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (allowlist.includes(user.email.toLowerCase())) {
    return { allowed: true, mode: "dev-allowlist" };
  }
  return { allowed: false, mode: null };
}
