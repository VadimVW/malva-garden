"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { fetchCart } from "@/lib/cart-api";
import { isCartGoneError } from "@/lib/cart-errors";
import { cartItemCount } from "@/lib/cart-optimistic";
import { clearCartToken, getCartToken } from "@/lib/cart-token";
import { MG_CART_UPDATED, type CartUpdatedDetail } from "@/lib/cart-ui-events";

const CART_ICON = "/images/figma/home/cart.svg";

export function FigmaCartLink() {
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
      /* мережа: лишаємо попередній count */
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

  return (
    <Link
      href="/cart"
      className={`relative z-10 flex h-12 w-[119px] shrink-0 items-center gap-3 overflow-visible rounded-[5px] px-2 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] ${pulse ? "mg-cart-pulse" : ""}`}
    >
      <Image
        src={CART_ICON}
        alt=""
        width={32}
        height={31}
        unoptimized
        className="h-8 w-8 shrink-0 object-contain"
      />
      <span className="text-[12px] font-bold text-[#F7F4EF]">Кошик</span>
      {count > 0 ? (
        <span
          className="absolute -right-1 -top-1 flex min-w-[20px] items-center justify-center rounded-full bg-[#2f6f4e] px-1.5 py-0.5 text-[10px] font-bold leading-none text-white ring-2 ring-[#5C97A8]"
          aria-label={`${count} у кошику`}
        >
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Link>
  );
}
