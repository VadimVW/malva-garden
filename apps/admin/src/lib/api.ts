import {
  clearStoredToken,
  getStoredToken,
  isSessionExpired,
  touchActivity,
} from "./auth";
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

export async function adminFetch<T>(
  path: string,
  init?: FetchOptions,
): Promise<T> {
  if (!init?.skipAuth && typeof window !== "undefined") {
    if (isSessionExpired()) {
      clearStoredToken();
      window.location.href = "/login?reason=idle";
      throw new ApiError("Сесія закінчилась", 401);
    }
    touchActivity();
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string> | undefined),
  };

  if (!init?.skipAuth) {
    const token = getStoredToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const url = `${getApiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, {
    ...init,
    headers,
    cache: init?.cache ?? "no-store",
  });

  if (res.status === 401 && !init?.skipAuth) {
    clearStoredToken();
    if (typeof window !== "undefined") {
      window.location.href = "/login?reason=session";
    }
    throw new ApiError("Сесія закінчилась", 401);
  }

  if (!res.ok) {
    const text = await res.text();
    throw new ApiError(parseApiError(text, res.status), res.status);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
