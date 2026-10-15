export function safeNextPath(next: string | null | undefined, fallback = "/"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) {
    return fallback;
  }
  return next;
}

export function reasonForPath(path: string): "checkout" | "admin" | "protected" {
  if (path.startsWith("/checkout")) return "checkout";
  if (path.startsWith("/admin")) return "admin";
  return "protected";
}

export function loginUrl(next: string, reason?: string): string {
  const params = new URLSearchParams({ next });
  if (reason) params.set("reason", reason);
  return `/login?${params.toString()}`;
}

export const LOGIN_MESSAGES: Record<string, string> = {
  checkout: "Please log in or create an account to continue to checkout.",
  protected: "Please log in to continue.",
  admin: "Please log in with an administrator account to open the dashboard.",
  expired: "Your session has expired. Please log in again.",
};
