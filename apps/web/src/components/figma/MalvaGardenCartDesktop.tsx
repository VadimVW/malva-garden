"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FigmaQuantityStepper } from "@/components/figma/FigmaQuantityStepper";
import {
  FigmaSecondaryLink,
  MalvaGardenFigmaPageShell,
} from "@/components/figma/MalvaGardenFigmaPageShell";
import { getApiBaseUrl } from "@/lib/api";
import { clearCartToken, getCartToken } from "@/lib/cart-token";

const PRODUCT_THUMB = "/images/figma/home/product-thumb.png";

type CartItem = {
  productId: string;
  name: string;
  slug: string;
  quantity: number;
  unitPrice: string;
  lineTotal: string;
  imageUrl?: string | null;
  stockQuantity?: number;
};

type CartResp = {
  token: string;
  subtotal: string;
  items: CartItem[];
};

function formatPrice(value: string) {
  return value.includes("грн") ? value : `${value} грн`;
}

function CartSummaryPanel({
  subtotal,
  itemCount,
  checkoutHref = "/checkout",
}: {
  subtotal: string;
  itemCount: number;
  checkoutHref?: string;
}) {
  return (
    <aside className="rounded-2xl bg-white p-6 shadow-[0px_6px_20px_rgba(0,0,0,0.08)] lg:sticky lg:top-[140px]">
      <h2 className="text-[18px] font-bold text-black">Підсумок</h2>
      <dl className="mt-5 space-y-3 text-[14px]">
        <div className="flex justify-between gap-4">
          <dt className="text-[#5a5a5a]">Товарів</dt>
          <dd className="font-semibold text-black">{itemCount}</dd>
        </div>
        <div className="flex justify-between gap-4 border-t border-[#e0e8ea] pt-3">
          <dt className="text-[16px] font-bold text-black">Разом</dt>
          <dd className="text-[20px] font-bold text-black">{formatPrice(subtotal)}</dd>
        </div>
      </dl>
      <p className="mt-4 text-[13px] leading-snug text-[#5a5a5a]">
        Безкоштовна доставка від 500 грн. Точну вартість доставки уточнить менеджер.
      </p>
      <Link
        href={checkoutHref}
        className="mt-6 flex w-full items-center justify-center rounded-xl bg-[#2f6f4e] px-6 py-3.5 text-[15px] font-bold text-white shadow-[0px_4px_12px_rgba(47,111,78,0.35)] transition-opacity hover:opacity-95"
      >
        Оформити замовлення
      </Link>
      <FigmaSecondaryLink href="/catalog/kvity" className="mt-3 w-full">
        Продовжити покупки
      </FigmaSecondaryLink>
    </aside>
  );
}

function EmptyCart() {
  return (
    <div className="flex flex-col items-center rounded-2xl bg-white px-6 py-16 text-center shadow-[0px_6px_20px_rgba(0,0,0,0.08)]">
      <div className="flex size-20 items-center justify-center rounded-full bg-[#E7F1F3]">
        <svg
          className="size-10 text-[#5C97A8]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden
        >
          <path
            d="M6 6h15l-1.5 9h-12L6 6zm0 0L5 3H2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="9" cy="20" r="1" />
          <circle cx="18" cy="20" r="1" />
        </svg>
      </div>
      <p className="mt-6 text-[20px] font-bold text-black">Кошик порожній</p>
      <p className="mt-2 max-w-sm text-[14px] text-[#5a5a5a]">
        Додайте насіння або рослини з каталогу — вони з’являться тут.
      </p>
      <FigmaSecondaryLink href="/catalog/kvity" className="mt-8">
        Перейти до каталогу
      </FigmaSecondaryLink>
    </div>
  );
}

export function MalvaGardenCartDesktop() {
  const [mounted, setMounted] = useState(false);
  const [cart, setCart] = useState<CartResp | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

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
      setError(e instanceof Error ? e.message : "Помилка завантаження кошика");
    }
  }

  useEffect(() => {
    setMounted(true);
    void load();
  }, []);

  async function setQty(productId: string, quantity: number) {
    const token = getCartToken();
    if (!token) return;
    setBusyId(productId);
    try {
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
    } finally {
      setBusyId(null);
    }
  }

  async function remove(productId: string) {
    const token = getCartToken();
    if (!token) return;
    setBusyId(productId);
    try {
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
    } finally {
      setBusyId(null);
    }
  }

  const breadcrumbs = [{ label: "Кошик" }];
  const isEmpty = !cart || cart.items.length === 0;
  const hasToken = mounted && Boolean(getCartToken());

  return (
    <MalvaGardenFigmaPageShell
      breadcrumbs={breadcrumbs}
      title="Кошик"
      subtitle={
        !mounted || isEmpty
          ? undefined
          : `${cart!.items.length} ${cart!.items.length === 1 ? "товар" : "товари"} у кошику`
      }
    >
      {!mounted ? (
        <p className="text-[14px] text-[#5a5a5a]">Завантаження…</p>
      ) : !hasToken && isEmpty ? (
        <EmptyCart />
      ) : !cart ? (
        <p className="text-[14px] text-[#5a5a5a]">Завантаження…</p>
      ) : isEmpty ? (
        <EmptyCart />
      ) : (
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
          <div className="min-w-0 flex-1 space-y-4">
            {error ? (
              <p
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-800"
                role="alert"
              >
                {error}
              </p>
            ) : null}
            <ul className="space-y-4">
              {cart.items.map((item) => {
                const maxQty = Math.max(item.stockQuantity ?? 99, 1);
                const imgSrc = item.imageUrl || PRODUCT_THUMB;
                const isRemote = imgSrc.startsWith("http");
                return (
                  <li
                    key={item.productId}
                    className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-[0px_6px_20px_rgba(0,0,0,0.08)] sm:flex-row sm:items-center sm:p-5"
                  >
                    <Link
                      href={`/product/${item.slug}`}
                      className="relative block size-[88px] shrink-0 overflow-hidden rounded-xl bg-[#f0f4f5]"
                    >
                      <Image
                        src={imgSrc}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="88px"
                        unoptimized={isRemote}
                      />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/product/${item.slug}`}
                        className="text-[16px] font-semibold text-black hover:text-[#5C97A8] hover:underline"
                      >
                        {item.name}
                      </Link>
                      <p className="mt-1 text-[14px] text-[#5a5a5a]">
                        {formatPrice(item.unitPrice)} за од.
                      </p>
                      <div className="mt-4 flex flex-wrap items-center gap-4">
                        <FigmaQuantityStepper
                          value={item.quantity}
                          min={1}
                          max={maxQty}
                          disabled={busyId === item.productId}
                          onDecrease={() =>
                            void setQty(item.productId, Math.max(1, item.quantity - 1))
                          }
                          onIncrease={() =>
                            void setQty(
                              item.productId,
                              Math.min(maxQty, item.quantity + 1),
                            )
                          }
                        />
                        <button
                          type="button"
                          disabled={busyId === item.productId}
                          onClick={() => void remove(item.productId)}
                          className="text-[13px] font-medium text-[#b91c1c] underline-offset-2 hover:underline disabled:opacity-50"
                        >
                          Видалити
                        </button>
                      </div>
                    </div>
                    <p className="shrink-0 text-[18px] font-bold text-black sm:text-right">
                      {formatPrice(item.lineTotal)}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="w-full shrink-0 lg:w-[320px]">
            <CartSummaryPanel
              subtotal={cart.subtotal}
              itemCount={cart.items.reduce((n, i) => n + i.quantity, 0)}
            />
          </div>
        </div>
      )}
    </MalvaGardenFigmaPageShell>
  );
}
