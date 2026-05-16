"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import {
  figmaInputClass,
  FigmaPrimaryButton,
  FigmaSecondaryLink,
  MalvaGardenFigmaPageShell,
} from "@/components/figma/MalvaGardenFigmaPageShell";
import { getApiBaseUrl } from "@/lib/api";
import { clearCartToken, getCartToken } from "@/lib/cart-token";

type CartItem = {
  productId: string;
  name: string;
  quantity: number;
  lineTotal: string;
};

type CartResp = {
  subtotal: string;
  items: CartItem[];
};

function formatPrice(value: string) {
  return value.includes("грн") ? value : `${value} грн`;
}

function labelClass() {
  return "block text-[13px] font-semibold text-black";
}

function OrderSummary({ cart }: { cart: CartResp }) {
  const count = cart.items.reduce((n, i) => n + i.quantity, 0);
  return (
    <aside className="rounded-2xl bg-white p-6 shadow-[0px_6px_20px_rgba(0,0,0,0.08)] lg:sticky lg:top-[140px]">
      <h2 className="text-[18px] font-bold text-black">Ваше замовлення</h2>
      <ul className="mt-4 max-h-[280px] space-y-3 overflow-y-auto pr-1">
        {cart.items.map((item) => (
          <li
            key={item.productId}
            className="flex justify-between gap-3 border-b border-[#eef2f3] pb-3 text-[13px] last:border-0 last:pb-0"
          >
            <span className="min-w-0 flex-1 text-[#333]">
              {item.name}{" "}
              <span className="text-[#9C9A9A]">× {item.quantity}</span>
            </span>
            <span className="shrink-0 font-semibold text-black">
              {formatPrice(item.lineTotal)}
            </span>
          </li>
        ))}
      </ul>
      <dl className="mt-5 space-y-2 border-t border-[#e0e8ea] pt-4 text-[14px]">
        <div className="flex justify-between gap-4">
          <dt className="text-[#5a5a5a]">Позицій</dt>
          <dd className="font-medium text-black">{count}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-[16px] font-bold text-black">До сплати</dt>
          <dd className="text-[20px] font-bold text-black">{formatPrice(cart.subtotal)}</dd>
        </div>
      </dl>
      <p className="mt-4 text-[12px] leading-snug text-[#5a5a5a]">
        Натискаючи «Підтвердити», ви погоджуєтесь з{" "}
        <Link href="/pages/publichna-oferta" className="text-[#5C97A8] underline">
          публічною офертою
        </Link>
        .
      </p>
    </aside>
  );
}

export function MalvaGardenCheckoutDesktop() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [cart, setCart] = useState<CartResp | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = getCartToken();
    if (!token) return;
    void (async () => {
      try {
        const res = await fetch(`${getApiBaseUrl()}/cart`, {
          headers: { "X-Cart-Token": token },
        });
        if (res.ok) setCart((await res.json()) as CartResp);
      } catch {
        /* summary optional */
      }
    })();
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
      setError(err instanceof Error ? err.message : "Помилка оформлення");
    } finally {
      setLoading(false);
    }
  }

  const hasToken = mounted && Boolean(getCartToken());

  return (
    <MalvaGardenFigmaPageShell
      breadcrumbs={[
        { label: "Кошик", href: "/cart" },
        { label: "Оформлення" },
      ]}
      title="Оформлення замовлення"
      subtitle="Заповніть контактні дані та адресу доставки"
    >
      {!mounted ? (
        <p className="text-[14px] text-[#5a5a5a]">Завантаження…</p>
      ) : !hasToken ? (
        <div className="rounded-2xl bg-white px-6 py-12 text-center shadow-[0px_6px_20px_rgba(0,0,0,0.08)]">
          <p className="text-[18px] font-bold text-black">Кошик порожній</p>
          <p className="mt-2 text-[14px] text-[#5a5a5a]">
            Спочатку додайте товари, щоб оформити замовлення.
          </p>
          <FigmaSecondaryLink href="/catalog/kvity" className="mt-6">
            У каталог
          </FigmaSecondaryLink>
        </div>
      ) : (
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
          <form
            className="min-w-0 flex-1 space-y-6 rounded-2xl bg-white p-6 shadow-[0px_6px_20px_rgba(0,0,0,0.08)] sm:p-8"
            onSubmit={(e) => void onSubmit(e)}
          >
            {error ? (
              <p
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-800"
                role="alert"
              >
                {error}
              </p>
            ) : null}

            <fieldset className="space-y-4">
              <legend className="text-[16px] font-bold text-black">Контакти</legend>
              <label className="block space-y-1.5">
                <span className={labelClass()}>Ім’я та прізвище *</span>
                <input
                  required
                  name="customerName"
                  autoComplete="name"
                  className={figmaInputClass}
                  placeholder="Олена Коваленко"
                />
              </label>
              <label className="block space-y-1.5">
                <span className={labelClass()}>Телефон *</span>
                <input
                  required
                  name="customerPhone"
                  type="tel"
                  autoComplete="tel"
                  className={figmaInputClass}
                  placeholder="+380 XX XXX XX XX"
                />
              </label>
              <label className="block space-y-1.5">
                <span className={labelClass()}>Email</span>
                <input
                  name="customerEmail"
                  type="email"
                  autoComplete="email"
                  className={figmaInputClass}
                  placeholder="email@example.com"
                />
              </label>
            </fieldset>

            <fieldset className="space-y-4">
              <legend className="text-[16px] font-bold text-black">Доставка</legend>
              <label className="block space-y-1.5">
                <span className={labelClass()}>Місто *</span>
                <input
                  required
                  name="deliveryCity"
                  autoComplete="address-level2"
                  className={figmaInputClass}
                  placeholder="Київ"
                />
              </label>
              <label className="block space-y-1.5">
                <span className={labelClass()}>Адреса *</span>
                <input
                  required
                  name="deliveryAddress"
                  autoComplete="street-address"
                  className={figmaInputClass}
                  placeholder="вул. Садова, 12, відділення Нової пошти №5"
                />
              </label>
              <label className="block space-y-1.5">
                <span className={labelClass()}>Спосіб доставки</span>
                <select name="deliveryMethod" className={figmaInputClass} defaultValue="">
                  <option value="">Оберіть спосіб</option>
                  <option value="nova_poshta">Нова пошта</option>
                  <option value="ukrposhta">Укрпошта</option>
                  <option value="courier">Кур’єр по місту</option>
                  <option value="pickup">Самовивіз</option>
                </select>
              </label>
            </fieldset>

            <fieldset className="space-y-4">
              <legend className="text-[16px] font-bold text-black">Оплата</legend>
              <label className="block space-y-1.5">
                <span className={labelClass()}>Спосіб оплати *</span>
                <select
                  required
                  name="paymentMethod"
                  className={figmaInputClass}
                  defaultValue="cash_on_delivery"
                >
                  <option value="cash_on_delivery">Оплата при отриманні</option>
                  <option value="card_on_delivery">Карткою при отриманні</option>
                  <option value="liqpay">Онлайн (LiqPay — незабаром)</option>
                </select>
              </label>
              <label className="block space-y-1.5">
                <span className={labelClass()}>Коментар до замовлення</span>
                <textarea
                  name="comment"
                  rows={3}
                  className={`${figmaInputClass} resize-y min-h-[96px]`}
                  placeholder="Зручний час дзвінка, побажання щодо упаковки…"
                />
              </label>
            </fieldset>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
              <FigmaPrimaryButton
                type="submit"
                disabled={loading}
                className="w-full sm:flex-1"
              >
                {loading ? "Відправка…" : "Підтвердити замовлення"}
              </FigmaPrimaryButton>
              <FigmaSecondaryLink href="/cart" className="w-full sm:w-auto">
                Назад до кошика
              </FigmaSecondaryLink>
            </div>
          </form>

          {cart && cart.items.length > 0 ? (
            <div className="w-full shrink-0 lg:w-[320px]">
              <OrderSummary cart={cart} />
            </div>
          ) : null}
        </div>
      )}
    </MalvaGardenFigmaPageShell>
  );
}
