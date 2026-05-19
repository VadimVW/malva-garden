"use client";

import Image from "next/image";
import { AddToCartButton } from "@/app/product/[slug]/ui";

const CART_BTN_SRC = "/images/figma/catalog/cart-btn.svg";

type Props = {
  productId: string;
  disabled?: boolean;
};

export function FigmaProductCardCartButton({ productId, disabled }: Props) {
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
        width={31}
        height={30}
        unoptimized
        className="h-[30px] w-[31px]"
        aria-hidden
      />
    </AddToCartButton>
  );
}
