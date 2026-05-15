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
import { adminFetch } from "@/lib/api";
import {
  clearStoredToken,
  getStoredToken,
  isSessionExpired,
  setStoredToken,
} from "@/lib/auth";
import type { LoginResponse } from "@/lib/types";

type AuthContextValue = {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = getStoredToken();
    if (!token || isSessionExpired()) {
      clearStoredToken();
      setIsAuthenticated(false);
    } else {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await adminFetch<LoginResponse>("/admin/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
        skipAuth: true,
      });
      setStoredToken(res.access_token);
      setIsAuthenticated(true);
      router.replace("/products");
    },
    [router],
  );

  const logout = useCallback(() => {
    clearStoredToken();
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
