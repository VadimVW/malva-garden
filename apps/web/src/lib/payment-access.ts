const KEY_PREFIX = "mg_payment_access:";

export function storePaymentAccessToken(orderNumber: string, token: string) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(`${KEY_PREFIX}${orderNumber}`, token);
}

export function getPaymentAccessToken(orderNumber: string): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(`${KEY_PREFIX}${orderNumber}`);
}

export function clearPaymentAccessToken(orderNumber: string) {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(`${KEY_PREFIX}${orderNumber}`);
}

export function paymentAccessQuery(orderNumber: string): string {
  const token = getPaymentAccessToken(orderNumber);
  return token ? `accessToken=${encodeURIComponent(token)}` : "";
}

export function withPaymentAccessQuery(
  baseUrl: string,
  orderNumber: string,
): string {
  const q = paymentAccessQuery(orderNumber);
  if (!q) return baseUrl;
  return baseUrl.includes("?") ? `${baseUrl}&${q}` : `${baseUrl}?${q}`;
}
