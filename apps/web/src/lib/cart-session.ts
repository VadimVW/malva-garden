import { getApiBaseUrl } from "@/lib/api";
import { clearCartToken, getCartToken, setCartToken } from "@/lib/cart-token";

/** Гостьовий кошик: валідний токен з localStorage або новий POST /cart */
export async function ensureCartToken(): Promise<string> {
  const existing = getCartToken();
  if (existing) {
    const check = await fetch(`${getApiBaseUrl()}/cart`, {
      headers: { "X-Cart-Token": existing },
    });
    if (check.ok) return existing;
    clearCartToken();
  }

  const res = await fetch(`${getApiBaseUrl()}/cart`, { method: "POST" });
  if (!res.ok) throw new Error(await res.text());
  const data = (await res.json()) as { token: string };
  setCartToken(data.token);
  return data.token;
}
