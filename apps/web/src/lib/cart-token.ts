export const CART_TOKEN_KEY = "malva_cart_token";

export function getCartToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(CART_TOKEN_KEY);
}

export function setCartToken(token: string) {
  window.localStorage.setItem(CART_TOKEN_KEY, token);
}

export function clearCartToken() {
  window.localStorage.removeItem(CART_TOKEN_KEY);
}
