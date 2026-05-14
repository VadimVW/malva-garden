"use client";

import { useState } from "react";
import { AddToCartButton } from "@/app/product/[slug]/ui";

type Props = {
  productId: string;
  maxQty: number;
  /** Статична кнопка без API (прев’ю Figma) */
  preview?: boolean;
};

export function ProductFigmaBuyBlock({
  productId,
  maxQty,
  preview,
}: Props) {
  const [qty, setQty] = useState(1);
  const dec = () => setQty((q) => Math.max(1, q - 1));
  const inc = () => setQty((q) => Math.min(Math.max(maxQty, 1), q + 1));

  return (
    <>
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
            disabled={maxQty <= 0}
            quantity={qty}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2f6f4e] py-3.5 text-[15px] font-bold text-white shadow-[0px_4px_12px_rgba(47,111,78,0.35)] transition-opacity hover:opacity-95 disabled:opacity-50"
            label="Додати в кошик"
          />
        </div>
      )}
    </>
  );
}
