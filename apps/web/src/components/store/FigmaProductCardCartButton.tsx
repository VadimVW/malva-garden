"use client";

import Image from "next/image";
import { AddToCartButton } from "@/app/product/[slug]/ui";

const CART_BTN_SRC = "/images/figma/catalog/cart-btn.svg";

type Props = {
  productId: string;
  disabled?: boolean;
  size?: "desktop" | "mobile";
};

export function FigmaProductCardCartButton({
  productId,
  disabled,
  size = "desktop",
}: Props) {
  const dim = size === "mobile" ? 25 : 30;
  const w = size === "mobile" ? 25 : 31;

  return (
    <AddToCartButton
      productId={productId}
      quantity={1}
      disabled={disabled}
      label="Додати в кошик"
      className="relative z-20 inline-flex shrink-0 rounded-full p-0 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Image
        src={CART_BTN_SRC}
        alt=""
        width={w}
        height={dim}
        unoptimized
        className={size === "mobile" ? "h-[25px] w-[25px]" : "h-[30px] w-[31px]"}
        aria-hidden
      />
    </AddToCartButton>
  );
}
