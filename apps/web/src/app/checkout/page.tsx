"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { getApiBaseUrl } from "@/lib/api";
import { clearCartToken, getCartToken } from "@/lib/cart-token";

export default function CheckoutPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setToken(getCartToken());
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const t = getCartToken();
    if (!t) {
      setError("Немає кошика. Додайте товар.");
      return;
    }
    const form = new FormData(e.currentTarget);
    const body = {
      customerName: String(form.get("customerName") ?? ""),
      customerPhone: String(form.get("customerPhone") ?? ""),
      customerEmail: String(form.get("customerEmail") ?? "") || undefined,
      deliveryCity: String(form.get("deliveryCity") ?? ""),
      deliveryAddress: String(form.get("deliveryAddress") ?? ""),
      deliveryMethod: String(form.get("deliveryMethod") ?? "") || undefined,
      paymentMethod: String(form.get("paymentMethod") ?? ""),
      comment: String(form.get("comment") ?? "") || undefined,
      cartToken: t,
    };
    setLoading(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as { orderNumber: string };
      clearCartToken();
      router.push(
        `/order/success?orderNumber=${encodeURIComponent(data.orderNumber)}`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Помилка");
    } finally {
      setLoading(false);
    }
  }

  if (token === null) {
    return <p className="px-4 py-10 text-center">Завантаження…</p>;
  }

  if (!token) {
    return (
      <div className="mx-auto max-w-xl space-y-4 px-4 py-10">
        <h1 className="text-2xl font-semibold">Оформлення</h1>
        <p className="text-slate-600">Спочатку додайте товари в кошик.</p>
        <Link href="/catalog/kvity" className="text-emerald-800 underline">
          У каталог
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-6 px-4 py-10">
      <h1 className="text-2xl font-semibold">Оформлення замовлення</h1>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <form className="space-y-4" onSubmit={(e) => void onSubmit(e)}>
        <label className="block space-y-1 text-sm">
          <span>Ім’я</span>
          <input
            required
            name="customerName"
            className="w-full rounded border px-3 py-2"
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span>Телефон</span>
          <input
            required
            name="customerPhone"
            className="w-full rounded border px-3 py-2"
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span>Email (необов’язково)</span>
          <input name="customerEmail" type="email" className="w-full rounded border px-3 py-2" />
        </label>
        <label className="block space-y-1 text-sm">
          <span>Місто</span>
          <input
            required
            name="deliveryCity"
            className="w-full rounded border px-3 py-2"
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span>Адреса</span>
          <input
            required
            name="deliveryAddress"
            className="w-full rounded border px-3 py-2"
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span>Спосіб доставки (текст)</span>
          <input name="deliveryMethod" className="w-full rounded border px-3 py-2" />
        </label>
        <label className="block space-y-1 text-sm">
          <span>Оплата</span>
          <select
            required
            name="paymentMethod"
            className="w-full rounded border px-3 py-2"
            defaultValue="cash_on_delivery"
          >
            <option value="cash_on_delivery">Накладний платіж</option>
            <option value="liqpay">LiqPay (інтеграція пізніше)</option>
          </select>
        </label>
        <label className="block space-y-1 text-sm">
          <span>Коментар</span>
          <textarea name="comment" className="w-full rounded border px-3 py-2" rows={3} />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-emerald-800 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "Відправка…" : "Підтвердити замовлення"}
        </button>
      </form>
    </div>
  );
}
