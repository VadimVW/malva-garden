import { getApiBaseUrl } from "@/lib/api";
import { CartApiError } from "@/lib/cart-errors";
import { ensureCartToken } from "@/lib/cart-session";
import { getCartToken } from "@/lib/cart-token";
import type { CartResponse } from "@/lib/cart-types";

async function readCartError(res: Response): Promise<string> {
  const text = await res.text();
  try {
    const json = JSON.parse(text) as { message?: string | string[] };
    if (Array.isArray(json.message)) return json.message.join(", ");
    if (typeof json.message === "string") return json.message;
  } catch {
    /* plain text */
  }
  return text || res.statusText;
}

async function cartFetch(
  input: RequestInfo,
  init?: RequestInit,
): Promise<Response> {
  const res = await fetch(input, init);
  if (res.ok) return res;
  throw new CartApiError(await readCartError(res), res.status);
}

function requireCartToken(): string {
  const token = getCartToken();
  if (!token) {
    throw new CartApiError("Немає кошика", 404);
  }
  return token;
}

export async function fetchCart(token: string): Promise<CartResponse | null> {
  const res = await fetch(`${getApiBaseUrl()}/cart`, {
    headers: { "X-Cart-Token": token },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new CartApiError(await readCartError(res), res.status);
  return res.json() as Promise<CartResponse>;
}

export async function addCartItem(
  productId: string,
  quantity: number,
): Promise<CartResponse> {
  const token = await ensureCartToken();
  const res = await cartFetch(`${getApiBaseUrl()}/cart/items`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Cart-Token": token,
    },
    body: JSON.stringify({ productId, quantity }),
  });
  return res.json() as Promise<CartResponse>;
}

export async function updateCartItemQuantity(
  productId: string,
  quantity: number,
): Promise<CartResponse> {
  const token = requireCartToken();
  const res = await cartFetch(
    `${getApiBaseUrl()}/cart/items/${encodeURIComponent(productId)}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-Cart-Token": token,
      },
      body: JSON.stringify({ quantity }),
    },
  );
  return res.json() as Promise<CartResponse>;
}

export async function removeCartItem(productId: string): Promise<CartResponse> {
  const token = requireCartToken();
  const res = await cartFetch(
    `${getApiBaseUrl()}/cart/items/${encodeURIComponent(productId)}`,
    {
      method: "DELETE",
      headers: { "X-Cart-Token": token },
    },
  );
  return res.json() as Promise<CartResponse>;
}
