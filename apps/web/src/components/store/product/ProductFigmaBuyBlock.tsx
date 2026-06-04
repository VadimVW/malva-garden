"use client";

import { useState } from "react";
import { AddToCartButton } from "@/app/product/[slug]/ui";

type Props = {
  productId: string;
  stockQuantity: number;
  /** Статична кнопка без API (прев’ю Figma) */
  preview?: boolean;
};

/** Залишок на складі для блоку покупки (§7.23.2). */
export function ProductStockAvailability({
  stockQuantity,
}: {
  stockQuantity: number;
}) {
  if (stockQuantity <= 0) {
    return (
      <p className="mt-4 text-[14px] font-semibold text-[#b91c1c]">Немає в наявності</p>
    );
  }
  return (
    <div className="mt-4 flex items-center gap-2 text-[14px] font-semibold text-[#2d6a4f]">
      <svg className="size-5 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M20 6L9 17l-5-5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>
        В наявності: <span className="tabular-nums">{stockQuantity}</span> шт.
      </span>
    </div>
  );
}

export function ProductFigmaBuyBlock({
  productId,
  stockQuantity,
  preview,
}: Props) {
  const [qty, setQty] = useState(1);
  const maxQty = Math.max(stockQuantity, 0);
  const dec = () => setQty((q) => Math.max(1, q - 1));
  const inc = () => setQty((q) => Math.min(Math.max(maxQty, 1), q + 1));

  return (
    <>
      <ProductStockAvailability stockQuantity={stockQuantity} />
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <span className="text-[14px] font-semibold text-black">Кількість:</span>
        <div className="inline-flex items-center rounded-lg bg-[#E8E8E8] p-1">
          <button
            type="button"
            onClick={dec}
            className="inline-flex size-9 items-center justify-center rounded-md text-lg font-medium text-[#5C97A8] transition-colors hover:bg-white disabled:opacity-40"
            aria-label="Менше"
            disabled={qty <= 1}
          >
            −
          </button>
          <span className="min-w-[2rem] text-center text-[15px] font-semibold text-black">
            {qty}
          </span>
          <button
            type="button"
            onClick={inc}
            className="inline-flex size-9 items-center justify-center rounded-md text-lg font-medium text-[#5C97A8] transition-colors hover:bg-white disabled:opacity-40"
            aria-label="Більше"
            disabled={qty >= Math.max(maxQty, 1)}
          >
            +
          </button>
        </div>
      </div>
      {preview ? (
        <button
          type="button"
          disabled
          className="mt-6 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-[#2f6f4e]/70 py-3.5 text-[15px] font-bold text-white opacity-90"
        >
          Додати в кошик (прев’ю)
        </button>
      ) : (
        <div className="mt-6">
          <AddToCartButton
            productId={productId}
            disabled={stockQuantity <= 0}
            quantity={qty}
            className="mg-btn-primary flex w-full items-center justify-center gap-2 rounded-xl bg-[#2f6f4e] py-3.5 text-[15px] font-bold text-white"
            label="Додати в кошик"
          />
        </div>
      )}
    </>
  );
}
