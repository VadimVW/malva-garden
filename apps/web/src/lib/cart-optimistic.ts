import type { CartItem, CartResponse } from "@/lib/cart-types";
import { cartItemCountFromResponse } from "@/lib/cart-ui-events";

export function parseMoney(value: string): number {
  const n = parseFloat(value.replace(/[^\d.,]/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

export function formatMoneyAmount(amount: number): string {
  const rounded = Math.round(amount * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2);
}

function lineTotal(unitPrice: string, quantity: number): string {
  return formatMoneyAmount(parseMoney(unitPrice) * quantity);
}

export function cartSubtotal(items: CartItem[]): string {
  const sum = items.reduce(
    (acc, item) => acc + parseMoney(item.unitPrice) * item.quantity,
    0,
  );
  return formatMoneyAmount(sum);
}

export function cartItemCount(items: CartItem[]): number {
  return cartItemCountFromResponse(items);
}

export function applyQuantityUpdate(
  cart: CartResponse,
  productId: string,
  quantity: number,
): CartResponse {
  if (!cart.items.some((item) => item.productId === productId)) {
    return cart;
  }
  const items = cart.items.map((item) =>
    item.productId === productId
      ? {
          ...item,
          quantity,
          lineTotal: lineTotal(item.unitPrice, quantity),
        }
      : item,
  );
  return { ...cart, items, subtotal: cartSubtotal(items) };
}

export function applyItemRemoved(
  cart: CartResponse,
  productId: string,
): CartResponse {
  const items = cart.items.filter((item) => item.productId !== productId);
  return { ...cart, items, subtotal: cartSubtotal(items) };
}
