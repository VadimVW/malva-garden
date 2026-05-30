"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchCart } from "@/lib/cart-api";
import { isCartGoneError } from "@/lib/cart-errors";
import { cartItemCount } from "@/lib/cart-optimistic";
import { clearCartToken, getCartToken } from "@/lib/cart-token";
import { MG_CART_UPDATED, type CartUpdatedDetail } from "@/lib/cart-ui-events";

export function useCartCount() {
  const [count, setCount] = useState(0);
  const [pulse, setPulse] = useState(false);

  const loadCount = useCallback(async () => {
    const token = getCartToken();
    if (!token) {
      setCount(0);
      return;
    }
    try {
      const data = await fetchCart(token);
      if (!data) {
        clearCartToken();
        setCount(0);
        return;
      }
      setCount(cartItemCount(data.items));
    } catch (e) {
      if (isCartGoneError(e)) {
        clearCartToken();
        setCount(0);
      }
    }
  }, []);

  useEffect(() => {
    void loadCount();
    function onUpdated(e: Event) {
      const detail = (e as CustomEvent<CartUpdatedDetail>).detail;
      if (detail?.reload) {
        void loadCount();
      } else if (typeof detail?.itemCount === "number") {
        setCount(detail.itemCount);
      } else if (typeof detail?.delta === "number") {
        setCount((c) => Math.max(0, c + detail.delta!));
      } else {
        void loadCount();
      }
      if (!detail?.reload) {
        setPulse(true);
        window.setTimeout(() => setPulse(false), 550);
      }
    }
    window.addEventListener(MG_CART_UPDATED, onUpdated);
    return () => window.removeEventListener(MG_CART_UPDATED, onUpdated);
  }, [loadCount]);

  return { count, pulse, reload: loadCount };
}
