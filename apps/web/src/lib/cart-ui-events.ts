export const MG_CART_UPDATED = "mg-cart-updated";
export const MG_CART_TOAST = "mg-cart-toast";

export type CartUpdatedDetail = {
  /** Точна кількість позицій (після відповіді API) */
  itemCount?: number;
  /** Оптимістична зміна лічильника в шапці */
  delta?: number;
  /** Перезавантажити лічильник у шапці з API (відкат після помилки) */
  reload?: boolean;
  /** Перезавантажити повний кошик на сторінці /cart */
  sync?: boolean;
};

export function dispatchCartUpdated(detail: number | CartUpdatedDetail) {
  if (typeof window === "undefined") return;
  const payload: CartUpdatedDetail =
    typeof detail === "number" ? { itemCount: detail } : detail;
  window.dispatchEvent(
    new CustomEvent<CartUpdatedDetail>(MG_CART_UPDATED, { detail: payload }),
  );
}

export function dispatchCartToast(message = "Товар додано в кошик") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<{ message: string }>(MG_CART_TOAST, {
      detail: { message },
    }),
  );
}

export function cartItemCountFromResponse(items: { quantity: number }[]) {
  return items.reduce((sum, line) => sum + line.quantity, 0);
}
