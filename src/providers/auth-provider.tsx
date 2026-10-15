"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getProfile, login as loginRequest } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { getAdminAccess, type AdminAccessMode } from "@/lib/admin-access";
import { AUTH_EXPIRED_EVENT, clearTokens, getTokens, setTokens } from "@/lib/auth-storage";
import type { LoginRequest, User } from "@/types";

type Status = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  user: User | null;
  status: Status;
  isAdmin: boolean;
  adminMode: AdminAccessMode | null;
  login: (credentials: LoginRequest) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    if (!getTokens()) {
      setStatus("unauthenticated");
      return;
    }
    let active = true;
    getProfile()
      .then((profile) => {
        if (!active) return;
        setUser(profile);
        setStatus("authenticated");
      })
      .catch((error: unknown) => {
        if (!active) return;
        if (error instanceof ApiError && error.status === 401) clearTokens();
        setStatus("unauthenticated");
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const onExpired = () => {
      setUser(null);
      setStatus("unauthenticated");
    };
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired);
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    const tokens = await loginRequest(credentials);
    setTokens({ accessToken: tokens.access_token, refreshToken: tokens.refresh_token });
    try {
      const profile = await getProfile();
      setUser(profile);
      setStatus("authenticated");
      return profile;
    } catch (error) {
      clearTokens();
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const access = getAdminAccess(user);
    return { user, status, isAdmin: access.allowed, adminMode: access.mode, login, logout };
  }, [user, status, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
