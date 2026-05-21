"use client";

import Link from "next/link";
import { useCustomerAuth } from "@/providers/CustomerAuthProvider";

export function FigmaStoreProfileLink() {
  const { isAuthenticated, isLoading } = useCustomerAuth();

  const href = isLoading
    ? "/account/login"
    : isAuthenticated
      ? "/account/orders"
      : "/account/login";

  return (
    <Link
      href={href}
      className="mg-header-profile relative inline-flex size-12 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/5 text-[#F7F4EF] transition-colors hover:bg-white/15"
      aria-label={isAuthenticated ? "Особистий кабінет" : "Увійти"}
    >
      <svg
        className="size-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    </Link>
  );
}
