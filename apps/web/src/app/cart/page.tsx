"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getApiBaseUrl } from "@/lib/api";
import { clearCartToken, getCartToken } from "@/lib/cart-token";

type CartResp = {
  token: string;
  subtotal: string;
  items: {
    productId: string;
    name: string;
    slug: string;
    quantity: number;
    unitPrice: string;
    lineTotal: string;
  }[];
};

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const [cart, setCart] = useState<CartResp | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const token = getCartToken();
    if (!token) {
      setCart(null);
      return;
    }
    setError(null);
    try {
      const res = await fetch(`${getApiBaseUrl()}/cart`, {
        headers: { "X-Cart-Token": token },
      });
      if (res.status === 404) {
        clearCartToken();
        setCart(null);
        return;
      }
      if (!res.ok) throw new Error(await res.text());
      setCart((await res.json()) as CartResp);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Помилка");
    }
  }

  useEffect(() => {
    setMounted(true);
    void load();
  }, []);

  async function setQty(productId: string, quantity: number) {
    const token = getCartToken();
    if (!token) return;
    const res = await fetch(
      `${getApiBaseUrl()}/cart/items/${encodeURIComponent(productId)}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-Cart-Token": token,
        },
        body: JSON.stringify({ quantity }),
      },
    );
    if (!res.ok) {
      setError(await res.text());
      return;
    }
    await load();
  }

  async function remove(productId: string) {
    const token = getCartToken();
    if (!token) return;
    const res = await fetch(
      `${getApiBaseUrl()}/cart/items/${encodeURIComponent(productId)}`,
      {
        method: "DELETE",
        headers: { "X-Cart-Token": token },
      },
    );
    if (!res.ok) {
      setError(await res.text());
      return;
    }
    await load();
  }

  if (!mounted) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 text-slate-600">
        Завантаження…
      </div>
    );
  }

  const token = getCartToken();
  if (!token && (!cart || cart.items.length === 0)) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-10">
        <h1 className="text-2xl font-semibold">Кошик порожній</h1>
        <p className="text-slate-600">Додайте товар з картки товару.</p>
        <Link href="/catalog/kvity" className="text-emerald-800 underline">
          У каталог
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <h1 className="text-2xl font-semibold">Кошик</h1>
      {error && <p className="text-sm text-red-700">{error}</p>}
      {!cart ? (
        <p className="text-slate-600">Завантаження…</p>
      ) : cart.items.length === 0 ? (
        <p className="text-slate-600">Порожньо.</p>
      ) : (
        <ul className="space-y-4">
          {cart.items.map((i) => (
            <li
              key={i.productId}
              className="flex flex-col gap-2 rounded border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <Link
                  href={`/product/${i.slug}`}
                  className="font-medium hover:underline"
                >
                  {i.name}
                </Link>
                <div className="text-sm text-slate-600">
                  {i.unitPrice} грн × {i.quantity} = {i.lineTotal} грн
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  className="rounded border px-2 py-1 text-sm"
                  onClick={() => void setQty(i.productId, Math.max(1, i.quantity - 1))}
                >
                  −
                </button>
                <span className="text-sm">{i.quantity}</span>
                <button
                  type="button"
                  className="rounded border px-2 py-1 text-sm"
                  onClick={() => void setQty(i.productId, i.quantity + 1)}
                >
                  +
                </button>
                <button
                  type="button"
                  className="text-sm text-red-700 underline"
                  onClick={() => void remove(i.productId)}
                >
                  Видалити
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {cart && cart.items.length > 0 && (
        <div className="flex items-center justify-between border-t pt-4">
          <span className="font-medium">Разом</span>
          <span>{cart.subtotal} грн</span>
        </div>
      )}
      {cart && cart.items.length > 0 && (
        <Link
          href="/checkout"
          className="inline-block rounded bg-emerald-800 px-4 py-2 text-sm font-medium text-white"
        >
          Оформити
        </Link>
      )}
    </div>
  );
}
