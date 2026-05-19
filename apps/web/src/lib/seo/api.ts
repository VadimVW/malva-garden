import { getApiBaseUrl } from "@/lib/api";

/** Fetch для SEO/sitemap — з ISR, без no-store. */
export async function seoApiFetch<T>(
  path: string,
  revalidateSeconds = 3600,
): Promise<T> {
  const url = `${getApiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    next: { revalidate: revalidateSeconds },
  });
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`);
  }
  return (await res.json()) as T;
}
