/** Публічна базова URL вітрини (canonical, OG, sitemap). */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;
  return "http://localhost:3300";
}

export const SITE_NAME = "Malva Garden";

export const DEFAULT_DESCRIPTION =
  "Інтернет-магазин насіння, квітів та садових товарів. Доставка по Україні.";

export const DEFAULT_OG_IMAGE_PATH = "/images/figma/home/logo-mark.png";

export function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
