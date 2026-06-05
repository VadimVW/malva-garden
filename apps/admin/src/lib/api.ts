import {
  clearStoredToken,
  getStoredRefreshToken,
  getStoredToken,
  isSessionExpired,
  setStoredTokens,
  touchActivity,
} from "./auth";
import {
  adminAuthModeHeaders,
  adminFetchCredentials,
  useAdminAuthCookies,
} from "./auth-mode";
import type { LoginResponse } from "./types";
import { parseApiError } from "./parse-api-error";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function getApiBaseUrl() {
  const base =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";
  return base.replace(/\/$/, "");
}

type FetchOptions = RequestInit & { skipAuth?: boolean };

let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  if (useAdminAuthCookies) {
    if (!refreshPromise) {
      refreshPromise = (async () => {
        try {
          const url = `${getApiBaseUrl()}/admin/auth/refresh`;
          const res = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...adminAuthModeHeaders(),
            },
            credentials: "include",
            cache: "no-store",
          });
          return res.ok;
        } catch {
          return false;
        } finally {
          refreshPromise = null;
        }
      })();
    }
    return refreshPromise;
  }

  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) return false;

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const url = `${getApiBaseUrl()}/admin/auth/refresh`;
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refreshToken }),
          cache: "no-store",
        });
        if (!res.ok) return false;
        const data = (await res.json()) as LoginResponse;
        if (!data.access_token || !data.refresh_token) return false;
        setStoredTokens(data.access_token, data.refresh_token);
        return true;
      } catch {
        return false;
      } finally {
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
}

function redirectToLogin(reason: "idle" | "session") {
  if (typeof window === "undefined") return;
  window.location.href = `/login?reason=${reason}`;
}

function buildAuthHeaders(
  base: Record<string, string>,
  skipAuth?: boolean,
): Record<string, string> {
  const headers = { ...base, ...adminAuthModeHeaders() };
  if (!skipAuth && !useAdminAuthCookies) {
    const token = getStoredToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

export async function adminFetch<T>(
  path: string,
  init?: FetchOptions,
): Promise<T> {
  if (!init?.skipAuth && typeof window !== "undefined") {
    if (isSessionExpired()) {
      clearStoredToken();
      redirectToLogin("idle");
      throw new ApiError("Сесія закінчилась", 401);
    }
    touchActivity();
  }

  const headers = buildAuthHeaders(
    {
      "Content-Type": "application/json",
      ...(init?.headers as Record<string, string> | undefined),
    },
    init?.skipAuth,
  );

  const url = `${getApiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  const credentials = adminFetchCredentials();
  const res = await fetch(url, {
    ...init,
    headers,
    ...(credentials ? { credentials } : {}),
    cache: init?.cache ?? "no-store",
  });

  if (res.status === 401 && !init?.skipAuth) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      const retryHeaders = buildAuthHeaders(
        {
          "Content-Type": "application/json",
          ...(init?.headers as Record<string, string> | undefined),
        },
        init?.skipAuth,
      );
      const retryRes = await fetch(url, {
        ...init,
        headers: retryHeaders,
        ...(credentials ? { credentials } : {}),
        cache: init?.cache ?? "no-store",
      });
      if (retryRes.ok) {
        if (retryRes.status === 204) return undefined as T;
        return (await retryRes.json()) as T;
      }
      if (retryRes.status !== 401) {
        const text = await retryRes.text();
        throw new ApiError(parseApiError(text, retryRes.status), retryRes.status);
      }
    }
    clearStoredToken();
    redirectToLogin("session");
    throw new ApiError("Сесія закінчилась", 401);
  }

  if (!res.ok) {
    const text = await res.text();
    throw new ApiError(parseApiError(text, res.status), res.status);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export async function adminUploadFile(file: File): Promise<{ url: string }> {
  if (typeof window !== "undefined") {
    if (isSessionExpired()) {
      clearStoredToken();
      redirectToLogin("idle");
      throw new ApiError("Сесія закінчилась", 401);
    }
    touchActivity();
  }

  const form = new FormData();
  form.append("file", file);

  const headers: Record<string, string> = { ...adminAuthModeHeaders() };
  if (!useAdminAuthCookies) {
    const token = getStoredToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const url = `${getApiBaseUrl()}/admin/uploads`;
  const credentials = adminFetchCredentials();
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: form,
    ...(credentials ? { credentials } : {}),
    cache: "no-store",
  });

  if (res.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      const retryHeaders: Record<string, string> = { ...adminAuthModeHeaders() };
      if (!useAdminAuthCookies) {
        const newToken = getStoredToken();
        if (newToken) retryHeaders.Authorization = `Bearer ${newToken}`;
      }
      const retryRes = await fetch(url, {
        method: "POST",
        headers: retryHeaders,
        body: form,
        ...(credentials ? { credentials } : {}),
        cache: "no-store",
      });
      if (retryRes.ok) return (await retryRes.json()) as { url: string };
      if (retryRes.status !== 401) {
        const text = await retryRes.text();
        throw new ApiError(parseApiError(text, retryRes.status), retryRes.status);
      }
    }
    clearStoredToken();
    redirectToLogin("session");
    throw new ApiError("Сесія закінчилась", 401);
  }

  if (!res.ok) {
    const text = await res.text();
    throw new ApiError(parseApiError(text, res.status), res.status);
  }

  return (await res.json()) as { url: string };
}

export async function adminLogout(): Promise<void> {
  try {
    if (useAdminAuthCookies) {
      await fetch(`${getApiBaseUrl()}/admin/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...adminAuthModeHeaders(),
        },
        credentials: "include",
        cache: "no-store",
      });
    } else {
      const refreshToken = getStoredRefreshToken();
      if (refreshToken) {
        await fetch(`${getApiBaseUrl()}/admin/auth/logout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refreshToken }),
          cache: "no-store",
        });
      }
    }
  } catch {
    /* best effort */
  }
  clearStoredToken();
}

/** Перевірка сесії в cookie mode (httpOnly — токенів у JS немає). */
export async function checkAdminSession(): Promise<boolean> {
  try {
    await adminFetch<{ id: string; email: string }>("/admin/auth/me");
    return true;
  } catch {
    return false;
  }
}
