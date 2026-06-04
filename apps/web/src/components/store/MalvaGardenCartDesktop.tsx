"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { FigmaQuantityStepper } from "@/components/ui/FigmaQuantityStepper";
import {
  FigmaSecondaryLink,
  MalvaGardenFigmaPageShell,
} from "@/components/store/MalvaGardenFigmaPageShell";
import { CartPageSkeleton } from "@/components/ui/MgSkeleton";
import {
  fetchCart,
  removeCartItem,
  updateCartItemQuantity,
} from "@/lib/cart-api";
import {
  CART_GONE_MESSAGE,
  isCartGoneError,
  isCartLineMissingError,
} from "@/lib/cart-errors";
import {
  applyItemRemoved,
  applyQuantityUpdate,
  cartItemCount,
} from "@/lib/cart-optimistic";
import type { CartResponse } from "@/lib/cart-types";
import { dispatchCartUpdated } from "@/lib/cart-ui-events";
import { clearCartToken, getCartToken } from "@/lib/cart-token";
import {
  formatOrderMinimumShortfallMessage,
  isBelowOrderMinimum,
} from "@/lib/orderMinimum";
import { useStoreHeaderSettings } from "@/providers/StoreHeaderSettingsProvider";

const PRODUCT_THUMB = "/images/figma/home/product-thumb.png";
const EXIT_MS = 220;

function formatPrice(value: string) {
  return value.includes("грн") ? value : `${value} грн`;
}

function CartSummaryPanel({
  subtotal,
  itemCount,
  orderMinimumAmount,
  checkoutHref = "/checkout",
}: {
  subtotal: string;
  itemCount: number;
  orderMinimumAmount: number;
  checkoutHref?: string;
}) {
  const belowMinimum = isBelowOrderMinimum(subtotal, orderMinimumAmount);

  return (
    <aside className="animate-mg-fade-in rounded-2xl bg-white p-6 shadow-[0px_6px_20px_rgba(0,0,0,0.08)] lg:sticky lg:top-[140px]">
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
      {belowMinimum ? (
        <p
          className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-[13px] leading-snug text-amber-950"
          role="status"
        >
          {formatOrderMinimumShortfallMessage(orderMinimumAmount, subtotal)}
        </p>
      ) : (
        <p className="mt-4 text-[13px] leading-snug text-[#5a5a5a]">
          Мінімальна сума замовлення — {orderMinimumAmount} грн.
        </p>
      )}
      {belowMinimum ? (
        <span
          aria-disabled
          className="mt-6 flex w-full cursor-not-allowed items-center justify-center rounded-xl bg-[#9c9a9a] px-6 py-3.5 text-[15px] font-bold text-white"
        >
          Оформити замовлення
        </span>
      ) : (
        <Link
          href={checkoutHref}
          className="mg-btn-primary mt-6 flex w-full items-center justify-center rounded-xl bg-[#2f6f4e] px-6 py-3.5 text-[15px] font-bold text-white"
        >
          Оформити замовлення
        </Link>
      )}
      <FigmaSecondaryLink href="/catalog/kvity" className="mt-3 w-full">
        Продовжити покупки
      </FigmaSecondaryLink>
    </aside>
  );
}

function EmptyCart() {
  return (
    <div className="animate-mg-scale-in flex flex-col items-center rounded-2xl bg-white px-6 py-16 text-center shadow-[0px_6px_20px_rgba(0,0,0,0.08)]">
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
  const { orderMinimumAmount } = useStoreHeaderSettings();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exitingIds, setExitingIds] = useState<Set<string>>(new Set());

  const cartRef = useRef<CartResponse | null>(null);
  const qtySeqRef = useRef<Map<string, number>>(new Map());
  const removingRef = useRef<Set<string>>(new Set());

  cartRef.current = cart;

  const commitCart = useCallback(
    (next: CartResponse | null, opts?: { sync?: boolean }) => {
      cartRef.current = next;
      setCart(next);
      const count = next ? cartItemCount(next.items) : 0;
      if (opts?.sync) {
        dispatchCartUpdated({ itemCount: count, sync: true });
      } else {
        dispatchCartUpdated(count);
      }
    },
    [],
  );

  const handleCartGone = useCallback(() => {
    clearCartToken();
    commitCart(null);
    setError(CART_GONE_MESSAGE);
  }, [commitCart]);

  const load = useCallback(async () => {
    const token = getCartToken();
    if (!token) {
      commitCart(null);
      setLoading(false);
      return;
    }
    setError(null);
    try {
      const data = await fetchCart(token);
      if (!data) {
        clearCartToken();
        commitCart(null);
        return;
      }
      commitCart(data);
    } catch (e) {
      if (isCartGoneError(e)) {
        handleCartGone();
      } else {
        setError(e instanceof Error ? e.message : "Помилка завантаження кошика");
      }
    } finally {
      setLoading(false);
    }
  }, [commitCart, handleCartGone]);

  useEffect(() => {
    setMounted(true);
    void load();
  }, [load]);

  async function setQty(productId: string, quantity: number) {
    const current = cartRef.current;
    if (!current) return;

    const seq = (qtySeqRef.current.get(productId) ?? 0) + 1;
    qtySeqRef.current.set(productId, seq);
    const snapshot = current;
    setError(null);
    commitCart(applyQuantityUpdate(current, productId, quantity));

    try {
      const data = await updateCartItemQuantity(productId, quantity);
      if (qtySeqRef.current.get(productId) !== seq) return;
      commitCart(data, { sync: true });
    } catch (e) {
      if (qtySeqRef.current.get(productId) !== seq) return;
      if (isCartGoneError(e)) {
        handleCartGone();
        return;
      }
      commitCart(snapshot);
      setError(e instanceof Error ? e.message : "Не вдалося оновити кількість");
    }
  }

  async function remove(productId: string) {
    if (removingRef.current.has(productId)) return;
    const current = cartRef.current;
    if (!current) return;

    removingRef.current.add(productId);
    const snapshot = current;
    setError(null);
    setExitingIds((prev) => new Set(prev).add(productId));

    await new Promise((r) => setTimeout(r, EXIT_MS));

    const latest = cartRef.current;
    if (latest) {
      commitCart(applyItemRemoved(latest, productId));
    }

    try {
      const data = await removeCartItem(productId);
      commitCart(data, { sync: true });
    } catch (e) {
      if (isCartGoneError(e)) {
        handleCartGone();
        return;
      }
      if (isCartLineMissingError(e)) {
        return;
      }
      commitCart(snapshot);
      setError(e instanceof Error ? e.message : "Не вдалося видалити товар");
    } finally {
      removingRef.current.delete(productId);
      setExitingIds((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  }

  const breadcrumbs = [{ label: "Кошик" }];
  const isEmpty = !cart || cart.items.length === 0;
  const hasToken = mounted && Boolean(getCartToken());
  const showSkeleton = !mounted || (hasToken && loading && !cart);

  return (
    <MalvaGardenFigmaPageShell
      breadcrumbs={breadcrumbs}
      title="Кошик"
      subtitle={
        !mounted || loading || isEmpty
          ? undefined
          : `${cart!.items.length} ${cart!.items.length === 1 ? "товар" : "товари"} у кошику`
      }
    >
      {showSkeleton ? (
        <CartPageSkeleton />
      ) : !hasToken && isEmpty ? (
        <EmptyCart />
      ) : isEmpty ? (
        <EmptyCart />
      ) : (
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
          <div className="min-w-0 flex-1 space-y-4">
            {error ? (
              <p
                className="mg-alert-error rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-800"
                role="alert"
              >
                {error}
              </p>
            ) : null}
            <ul className="space-y-4">
              {cart!.items.map((item) => {
                const maxQty = Math.max(item.stockQuantity ?? 99, 1);
                const imgSrc = item.imageUrl || PRODUCT_THUMB;
                const isRemote = imgSrc.startsWith("http");
                const exiting = exitingIds.has(item.productId);
                const rowBusy = exiting;
                return (
                  <li
                    key={item.productId}
                    className={`flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-[0px_6px_20px_rgba(0,0,0,0.08)] sm:flex-row sm:items-center sm:p-5 ${
                      exiting ? "mg-cart-row-exit" : "animate-mg-fade-up"
                    }`}
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
                          disabled={rowBusy}
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
                          disabled={rowBusy}
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
              subtotal={cart!.subtotal}
              itemCount={cart!.items.reduce((n, i) => n + i.quantity, 0)}
              orderMinimumAmount={orderMinimumAmount}
            />
          </div>
        </div>
      )}
    </MalvaGardenFigmaPageShell>
  );
}
