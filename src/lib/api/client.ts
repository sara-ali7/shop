import { AUTH_EXPIRED_EVENT, clearTokens, getTokens, setTokens } from "@/lib/auth-storage";
import type { LoginResponse } from "@/types";

export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "https://api.escuelajs.co/api/v1"
).replace(/\/+$/, "");

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export function getErrorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function isMissingRecord(error: unknown): boolean {
  return error instanceof ApiError && (error.status === 404 || error.status === 400);
}

type Query = Record<string, string | number | undefined | null>;

interface RequestOptions {
  method?: "GET" | "POST" | "PUT";
  body?: unknown;
  query?: Query;
  auth?: boolean;
}

function buildUrl(path: string, query?: Query): string {
  const url = new URL(`${API_URL}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

function extractMessage(data: unknown, fallback: string): string {
  if (data && typeof data === "object" && "message" in data) {
    const message = (data as { message: unknown }).message;
    if (typeof message === "string" && message) return message;
    if (Array.isArray(message)) {
      const joined = message.filter((m) => typeof m === "string").join(" ");
      if (joined) return joined;
    }
  }
  return fallback;
}

let refreshing: Promise<string | null> | null = null;

function refreshAccessToken(): Promise<string | null> {
  if (refreshing) return refreshing;
  const stored = getTokens();
  if (!stored) return Promise.resolve(null);

  refreshing = (async () => {
    try {
      const res = await fetch(buildUrl("/auth/refresh-token"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: stored.refreshToken }),
      });
      if (!res.ok) return null;
      const data = (await res.json()) as Partial<LoginResponse>;
      if (!data.access_token || !data.refresh_token) return null;
      setTokens({ accessToken: data.access_token, refreshToken: data.refresh_token });
      return data.access_token;
    } catch {
      return null;
    } finally {
      refreshing = null;
    }
  })();
  return refreshing;
}

async function send(path: string, options: RequestOptions, token?: string): Promise<Response> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    return await fetch(buildUrl(path, options.query), {
      method: options.method ?? "GET",
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new ApiError("Unable to reach the server. Check your connection and try again.", 0);
  }
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  let token: string | undefined;
  if (options.auth) {
    token = getTokens()?.accessToken;
    if (!token) throw new ApiError("You need to log in to do that.", 401);
  }

  let res = await send(path, options, token);

  if (res.status === 401 && options.auth) {
    const fresh = await refreshAccessToken();
    if (fresh) {
      res = await send(path, options, fresh);
    }
    if (!fresh || res.status === 401) {
      clearTokens();
      if (typeof window !== "undefined") window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
      throw new ApiError("Your session has expired. Please log in again.", 401);
    }
  }

  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    throw new ApiError(extractMessage(data, `Request failed (${res.status}).`), res.status, data);
  }
  return data as T;
}
