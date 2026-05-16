"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { getApiBaseUrl } from "@/lib/api";
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
      const res = await fetch(`${getApiBaseUrl()}/cart`, {
        headers: { "X-Cart-Token": token },
      });
      if (res.status === 404) {
        clearCartToken();
        setCount(0);
        return;
      }
      if (!res.ok) {
        setCount(0);
        return;
      }
      const data = (await res.json()) as { items: { quantity: number }[] };
      setCount(data.items.reduce((s, i) => s + i.quantity, 0));
    } catch {
      setCount(0);
    }
  }, []);

  useEffect(() => {
    void loadCount();
    function onUpdated(e: Event) {
      const detail = (e as CustomEvent<CartUpdatedDetail>).detail;
      if (typeof detail?.itemCount === "number") {
        setCount(detail.itemCount);
      } else {
        void loadCount();
      }
      setPulse(true);
      window.setTimeout(() => setPulse(false), 550);
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
