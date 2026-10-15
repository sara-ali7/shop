const KEY = "shop.auth.tokens";

export const AUTH_EXPIRED_EVENT = "shop:auth-expired";

export interface StoredTokens {
  accessToken: string;
  refreshToken: string;
}

export function getTokens(): StoredTokens | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof (parsed as StoredTokens).accessToken === "string" &&
      typeof (parsed as StoredTokens).refreshToken === "string"
    ) {
      return parsed as StoredTokens;
    }
    return null;
  } catch {
    return null;
  }
}

export function setTokens(tokens: StoredTokens): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(tokens));
  } catch {
  }
}

export function clearTokens(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
  }
}
