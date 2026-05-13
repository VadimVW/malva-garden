"use client";

import { useState } from "react";
import { getApiBaseUrl } from "@/lib/api";
import { getCartToken, setCartToken } from "@/lib/cart-token";

type Props = {
  productId: string;
  disabled?: boolean;
};

export function AddToCartButton({ productId, disabled }: Props) {
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onAdd() {
    setMsg(null);
    setLoading(true);
    try {
      let token = getCartToken();
      if (!token) {
        const res = await fetch(`${getApiBaseUrl()}/cart`, {
          method: "POST",
        });
        if (!res.ok) throw new Error(await res.text());
        const data = (await res.json()) as { token: string };
        token = data.token;
        setCartToken(token);
      }
      const res = await fetch(`${getApiBaseUrl()}/cart/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Cart-Token": token,
        },
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      if (!res.ok) throw new Error(await res.text());
      setMsg("Додано в кошик");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Помилка");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={onAdd}
        disabled={disabled || loading}
        className="rounded bg-emerald-800 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {loading ? "Зачекайте…" : "У кошик"}
      </button>
      {msg && <p className="text-sm text-slate-600">{msg}</p>}
    </div>
  );
}
