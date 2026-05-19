"use client";

import { useState, type MouseEvent, type ReactNode } from "react";
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
  /** Підпис кнопки або aria-label, якщо передано children */
  label?: string;
  children?: ReactNode;
};

export function AddToCartButton({
  productId,
  disabled,
  quantity = 1,
  className,
  label,
  children,
}: Props) {
  const [loading, setLoading] = useState(false);
  const qty = Math.max(1, Math.floor(quantity));
  const ariaLabel = label ?? (children ? "Додати в кошик" : undefined);

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

  function onClick(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    void onAdd();
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      className={
        className ??
        "mg-btn-primary rounded bg-emerald-800 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      }
    >
      {loading
        ? children
          ? "…"
          : "Зачекайте…"
        : (children ?? label ?? "У кошик")}
    </button>
  );
}
