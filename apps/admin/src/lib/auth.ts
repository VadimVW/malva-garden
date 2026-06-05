const TOKEN_KEY = "mg_admin_token";
const REFRESH_TOKEN_KEY = "mg_admin_refresh_token";
const ACTIVITY_KEY = "mg_admin_last_activity";
export const IDLE_MS = 30 * 60 * 1000;

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(TOKEN_KEY);
}

export function getStoredRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setStoredTokens(accessToken: string, refreshToken: string) {
  sessionStorage.setItem(TOKEN_KEY, accessToken);
  sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  touchActivity();
}

export function setStoredToken(accessToken: string) {
  sessionStorage.setItem(TOKEN_KEY, accessToken);
  touchActivity();
}

export function clearStoredToken() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  sessionStorage.removeItem(ACTIVITY_KEY);
}

export function touchActivity() {
  sessionStorage.setItem(ACTIVITY_KEY, String(Date.now()));
}

export function isSessionExpired(): boolean {
  const raw = sessionStorage.getItem(ACTIVITY_KEY);
  if (!raw) return false;
  const last = Number(raw);
  if (Number.isNaN(last)) return false;
  return Date.now() - last > IDLE_MS;
}
