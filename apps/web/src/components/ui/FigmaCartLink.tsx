"use client";

import Link from "next/link";
import { FigmaCartIcon } from "@/components/ui/FigmaCartIcon";
import { useCartCount } from "@/lib/useCartCount";

export function FigmaCartLink() {
  const { count, pulse } = useCartCount();

  return (
    <Link
      href="/cart"
      className={`relative z-10 flex h-12 w-[119px] shrink-0 items-center gap-3 overflow-visible rounded-[5px] px-2 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] ${pulse ? "mg-cart-pulse" : ""}`}
    >
      <FigmaCartIcon className="size-8 shrink-0 text-[#F5F5F5]" />
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
