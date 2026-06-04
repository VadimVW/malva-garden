/** Публічна базова URL вітрини (canonical, OG, sitemap). */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;
  return "http://localhost:3300";
}

function isInternalHost(host: string): boolean {
  const hostname = host.split(":")[0]?.toLowerCase() ?? host;
  return (
    hostname === "0.0.0.0" ||
    hostname === "127.0.0.1" ||
    hostname === "localhost" ||
    hostname === "web" ||
    hostname.endsWith(".internal")
  );
}

/**
 * Публічний origin для редіректів (Route Handlers за Caddy/Docker).
 * Без цього `new URL(path, request.url)` дає https://0.0.0.0:3000/… (HOSTNAME у контейнері).
 */
export function getPublicOrigin(request?: Request): string {
  if (request) {
    const forwardedHost = request.headers
      .get("x-forwarded-host")
      ?.split(",")[0]
      ?.trim();
    const forwardedProto = request.headers
      .get("x-forwarded-proto")
      ?.split(",")[0]
      ?.trim();
    const host =
      forwardedHost ?? request.headers.get("host")?.split(",")[0]?.trim();
    if (host && !isInternalHost(host)) {
      const proto =
        forwardedProto === "http" || forwardedProto === "https"
          ? forwardedProto
          : "https";
      return `${proto}://${host}`.replace(/\/$/, "");
    }
    try {
      const parsed = new URL(request.url);
      if (!isInternalHost(parsed.host)) {
        return parsed.origin;
      }
    } catch {
      /* ignore */
    }
  }
  return getSiteUrl();
}

export const SITE_NAME = "Malva Garden";

export const DEFAULT_DESCRIPTION =
  "Інтернет-магазин насіння, квітів та садових товарів. Доставка по Україні.";

export const DEFAULT_OG_IMAGE_PATH = "/images/figma/home/logo-mark.png";

export function absoluteUrl(path: string, request?: Request): string {
  const base = getPublicOrigin(request);
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
