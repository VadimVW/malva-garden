import type { Request, Response } from "express";

export const ADMIN_ACCESS_COOKIE = "mg_admin_access";
export const ADMIN_REFRESH_COOKIE = "mg_admin_refresh";
export const ADMIN_AUTH_MODE_HEADER = "x-admin-auth";
export const ADMIN_AUTH_COOKIE_MODE = "cookie";

export function wantsCookieAuth(req: Request): boolean {
  const raw = req.headers[ADMIN_AUTH_MODE_HEADER];
  return typeof raw === "string" && raw.toLowerCase() === ADMIN_AUTH_COOKIE_MODE;
}

export function readRefreshToken(req: Request, bodyToken?: string): string | undefined {
  const fromCookie = req.cookies?.[ADMIN_REFRESH_COOKIE];
  if (typeof fromCookie === "string" && fromCookie.length > 0) return fromCookie;
  if (bodyToken?.trim()) return bodyToken.trim();
  return undefined;
}

export type CookieAuthOptions = {
  secure: boolean;
  domain?: string;
  accessMaxAgeSec: number;
  refreshMaxAgeSec: number;
};

export function setAdminAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
  opts: CookieAuthOptions,
) {
  const base = {
    httpOnly: true,
    secure: opts.secure,
    sameSite: "lax" as const,
    ...(opts.domain ? { domain: opts.domain } : {}),
  };
  res.cookie(ADMIN_ACCESS_COOKIE, accessToken, {
    ...base,
    path: "/api/v1/admin",
    maxAge: opts.accessMaxAgeSec * 1000,
  });
  res.cookie(ADMIN_REFRESH_COOKIE, refreshToken, {
    ...base,
    path: "/api/v1/admin/auth",
    maxAge: opts.refreshMaxAgeSec * 1000,
  });
}

export function clearAdminAuthCookies(res: Response, opts: Pick<CookieAuthOptions, "secure" | "domain">) {
  const base = {
    httpOnly: true,
    secure: opts.secure,
    sameSite: "lax" as const,
    maxAge: 0,
    ...(opts.domain ? { domain: opts.domain } : {}),
  };
  res.cookie(ADMIN_ACCESS_COOKIE, "", { ...base, path: "/api/v1/admin" });
  res.cookie(ADMIN_REFRESH_COOKIE, "", { ...base, path: "/api/v1/admin/auth" });
}
