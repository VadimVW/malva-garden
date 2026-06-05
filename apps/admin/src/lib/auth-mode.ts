/** Prod (VPS): httpOnly cookies. Dev: Bearer + sessionStorage. */
export const useAdminAuthCookies =
  process.env.NEXT_PUBLIC_ADMIN_AUTH_COOKIES === "true";

export const ADMIN_AUTH_MODE_HEADER = "X-Admin-Auth";
export const ADMIN_AUTH_COOKIE_MODE = "cookie";

export function adminAuthModeHeaders(): Record<string, string> {
  if (!useAdminAuthCookies) return {};
  return { [ADMIN_AUTH_MODE_HEADER]: ADMIN_AUTH_COOKIE_MODE };
}

export function adminFetchCredentials(): RequestCredentials | undefined {
  return useAdminAuthCookies ? "include" : "same-origin";
}
