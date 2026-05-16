export const MG_CART_UPDATED = "mg-cart-updated";
export const MG_CART_TOAST = "mg-cart-toast";

export type CartUpdatedDetail = { itemCount: number };

export function dispatchCartUpdated(itemCount: number) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<CartUpdatedDetail>(MG_CART_UPDATED, {
      detail: { itemCount },
    }),
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
