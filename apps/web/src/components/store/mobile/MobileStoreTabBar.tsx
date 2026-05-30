"use client";

import Link from "next/link";
import { Inter } from "next/font/google";
import { useCustomerAuth } from "@/providers/CustomerAuthProvider";
import { useCartCount } from "@/lib/useCartCount";
import { useMobileCatalogDrawer } from "./MobileCatalogDrawerContext";

const inter = Inter({
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  display: "swap",
});

function MenuIcon() {
  return (
    <svg
      className="size-[25px]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg
      className="size-[25px]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <path d="M6 6h15l-1.5 9h-12z" strokeLinejoin="round" />
      <path d="M6 6l-1-3H3" strokeLinecap="round" />
      <circle cx="9" cy="20" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="18" cy="20" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      className="size-[25px]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export function MobileStoreTabBar() {
  const { openDrawer } = useMobileCatalogDrawer();
  const { count, pulse } = useCartCount();
  const { isAuthenticated, isLoading } = useCustomerAuth();
  const accountHref = isLoading
    ? "/account/login"
    : isAuthenticated
      ? "/account/orders"
      : "/account/login";

  return (
    <nav
      className={`fixed inset-x-0 bottom-0 z-40 px-[13px] pb-[max(8px,env(safe-area-inset-bottom))] lg:hidden ${inter.className}`}
      aria-label="Головне меню"
    >
      <div className="mx-auto flex h-[var(--mg-mobile-tab-bar-h)] max-w-[350px] items-center justify-center rounded-[16px] bg-[rgba(92,151,168,0.92)] shadow-[0px_4px_2px_rgba(0,0,0,0.25)] backdrop-blur-sm">
        <div className="flex w-full items-start justify-center gap-[80px]">
          <button
            type="button"
            onClick={openDrawer}
            className="flex w-[47px] flex-col items-center text-white"
          >
            <MenuIcon />
            <span className="text-[12px] leading-normal">Каталог</span>
          </button>
          <Link
            href="/cart"
            className={`relative flex w-[38px] flex-col items-center text-white ${pulse ? "mg-cart-pulse" : ""}`}
          >
            <CartIcon />
            <span className="text-[12px] leading-normal">Кошик</span>
            {count > 0 ? (
              <span className="absolute -right-1 top-0 flex min-w-[18px] items-center justify-center rounded-full bg-[#2f6f4e] px-1 text-[10px] font-bold leading-none text-white">
                {count > 99 ? "99+" : count}
              </span>
            ) : null}
          </Link>
          <Link href={accountHref} className="flex w-[45px] flex-col items-center text-white">
            <UserIcon />
            <span className="text-[12px] leading-normal">Кабінет</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
