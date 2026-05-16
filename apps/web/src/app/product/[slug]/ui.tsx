"use client";

import { useState } from "react";
import { getApiBaseUrl } from "@/lib/api";
import {
  cartItemCountFromResponse,
  dispatchCartToast,
  dispatchCartUpdated,
} from "@/lib/cart-ui-events";
import { ensureCartToken } from "@/lib/cart-session";

type Props = {
  productId: string;
  disabled?: boolean;
  /** Кількість позицій для додавання за один клік */
  quantity?: number;
  className?: string;
  label?: string;
};

type CartLine = { quantity: number };

export function AddToCartButton({
  productId,
  disabled,
  quantity = 1,
  className,
  label,
}: Props) {
  const [loading, setLoading] = useState(false);
  const qty = Math.max(1, Math.floor(quantity));

  async function onAdd() {
    setLoading(true);
    try {
      const token = await ensureCartToken();
      const res = await fetch(`${getApiBaseUrl()}/cart/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Cart-Token": token,
        },
        body: JSON.stringify({ productId, quantity: qty }),
      });
      if (!res.ok) throw new Error(await res.text());
      const cart = (await res.json()) as { items: CartLine[] };
      dispatchCartUpdated(cartItemCountFromResponse(cart.items));
      dispatchCartToast("Товар додано в кошик");
    } catch (e) {
      dispatchCartToast(
        e instanceof Error ? e.message : "Не вдалося додати в кошик",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void onAdd()}
      disabled={disabled || loading}
      className={
        className ??
        "mg-btn-primary rounded bg-emerald-800 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      }
    >
      {loading ? "Зачекайте…" : (label ?? "У кошик")}
    </button>
  );
}
