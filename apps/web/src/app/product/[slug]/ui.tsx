"use client";

import { useState } from "react";
import { addCartItem } from "@/lib/cart-api";
import { cartItemCount } from "@/lib/cart-optimistic";
import {
  dispatchCartToast,
  dispatchCartUpdated,
} from "@/lib/cart-ui-events";

type Props = {
  productId: string;
  disabled?: boolean;
  /** Кількість позицій для додавання за один клік */
  quantity?: number;
  className?: string;
  label?: string;
};

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
    dispatchCartUpdated({ delta: qty });
    try {
      const cart = await addCartItem(productId, qty);
      dispatchCartUpdated({
        itemCount: cartItemCount(cart.items),
        sync: true,
      });
      dispatchCartToast("Товар додано в кошик");
    } catch (e) {
      dispatchCartUpdated({ reload: true });
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
