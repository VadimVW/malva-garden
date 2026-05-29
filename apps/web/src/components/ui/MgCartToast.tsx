"use client";

import { useEffect, useState } from "react";
import { MG_CART_TOAST } from "@/lib/cart-ui-events";

export function MgCartToast() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let hideTimer: number | undefined;

    function onToast(e: Event) {
      const detail = (e as CustomEvent<{ message: string }>).detail;
      setMessage(detail?.message ?? "Товар додано в кошик");
      if (hideTimer) window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(() => setMessage(null), 3200);
    }

    window.addEventListener(MG_CART_TOAST, onToast);
    return () => {
      window.removeEventListener(MG_CART_TOAST, onToast);
      if (hideTimer) window.clearTimeout(hideTimer);
    };
  }, []);

  if (!message) return null;

  return (
    <div className="mg-toast" role="status" aria-live="polite">
      <svg
        className="size-5 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden
      >
        <path
          d="M20 6L9 17l-5-5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {message}
    </div>
  );
}
