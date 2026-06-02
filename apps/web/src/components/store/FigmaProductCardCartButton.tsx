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
  const dim = size === "mobile" ? 28 : 30;
  const w = size === "mobile" ? 28 : 31;
  const buttonClassName =
    size === "mobile"
      ? "relative z-20 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full p-0 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      : "relative z-20 inline-flex shrink-0 rounded-full p-0 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <AddToCartButton
      productId={productId}
      quantity={1}
      disabled={disabled}
      label="Додати в кошик"
      className={buttonClassName}
    >
      <Image
        src={CART_BTN_SRC}
        alt=""
        width={w}
        height={dim}
        unoptimized
        className={size === "mobile" ? "h-7 w-7" : "h-[30px] w-[31px]"}
        aria-hidden
      />
    </AddToCartButton>
  );
}
