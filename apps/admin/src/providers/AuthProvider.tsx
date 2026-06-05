"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { adminFetch, adminLogout, checkAdminSession } from "@/lib/api";
import { useAdminAuthCookies } from "@/lib/auth-mode";
import {
  clearStoredToken,
  getStoredRefreshToken,
  getStoredToken,
  isSessionExpired,
  setStoredTokens,
  touchActivity,
} from "@/lib/auth";
import type { LoginResponse } from "@/lib/types";

type AuthContextValue = {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (useAdminAuthCookies) {
        if (isSessionExpired()) {
          clearStoredToken();
          if (!cancelled) setIsAuthenticated(false);
        } else {
          const ok = await checkAdminSession();
          if (!cancelled) setIsAuthenticated(ok);
        }
      } else {
        const token = getStoredToken();
        const refresh = getStoredRefreshToken();
        if (!token || !refresh || isSessionExpired()) {
          clearStoredToken();
          if (!cancelled) setIsAuthenticated(false);
        } else if (!cancelled) {
          setIsAuthenticated(true);
        }
      }
      if (!cancelled) setIsLoading(false);
    }

    void init();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await adminFetch<LoginResponse>("/admin/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
        skipAuth: true,
      });
      if (!useAdminAuthCookies) {
        if (!res.access_token || !res.refresh_token) {
          throw new Error("Немає токенів у відповіді API");
        }
        setStoredTokens(res.access_token, res.refresh_token);
      } else {
        touchActivity();
      }
      setIsAuthenticated(true);
      router.replace("/products");
    },
    [router],
  );

  const logout = useCallback(async () => {
    await adminLogout();
    setIsAuthenticated(false);
    router.replace("/login");
  }, [router]);

  const value = useMemo(
    () => ({ isAuthenticated, isLoading, login, logout }),
    [isAuthenticated, isLoading, login, logout],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
