export function getApiBaseUrl() {
  // SSR у Docker: прямий виклик api:4000 (не через публічний URL / HTTPS)
  if (typeof window === "undefined" && process.env.INTERNAL_API_URL?.trim()) {
    return process.env.INTERNAL_API_URL.trim().replace(/\/$/, "");
  }
  const base =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";
  return base.replace(/\/$/, "");
}

export type ApiFetchOptions = RequestInit & {
  /** ISR для публічних GET (секунди). Без значення — `no-store`. */
  revalidateSeconds?: number;
};

export async function apiFetch<T>(
  path: string,
  init?: ApiFetchOptions,
): Promise<T> {
  const { revalidateSeconds, ...fetchInit } = init ?? {};
  const url = `${getApiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;

  const nextInit =
    revalidateSeconds !== undefined
      ? { next: { revalidate: revalidateSeconds } }
      : undefined;

  const res = await fetch(url, {
    ...fetchInit,
    ...(nextInit ?? {}),
    headers: {
      "Content-Type": "application/json",
      ...(fetchInit.headers ?? {}),
    },
    cache:
      nextInit !== undefined
        ? undefined
        : (fetchInit.cache ?? "no-store"),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `${res.status} ${res.statusText}`);
  }
  return (await res.json()) as T;
}
