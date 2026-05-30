import Image from "next/image";
import Link from "next/link";
import { FigmaProductCardCartButton } from "@/components/store/FigmaProductCardCartButton";
import { ProductCardTitle } from "@/components/store/ProductCardTitle";
import { FIGMA_PRODUCT_CARD_IMG } from "@/components/store/figmaProductCardAssets";

const DEFAULT_THUMB = "/images/figma/home/product-thumb.png";
const CARD_CORNER_W = 33;
const CARD_CORNER_H = 46;

export type FigmaProductCardMobileProps = {
  productId: string;
  slug: string;
  title: string;
  subtitle: string;
  price: string;
  stockQuantity?: number;
  imageUrl?: string | null;
  imageFallback?: string;
  titleAs?: "h2" | "h3";
};

export function FigmaProductCardMobile({
  productId,
  slug,
  title,
  subtitle,
  price,
  stockQuantity = 1,
  imageUrl,
  imageFallback = DEFAULT_THUMB,
  titleAs = "h2",
}: FigmaProductCardMobileProps) {
  const thumbSrc = imageUrl || imageFallback;
  const remote = thumbSrc.startsWith("http") || thumbSrc.startsWith("data:");
  const outOfStock = stockQuantity <= 0;

  return (
    <article className="mg-product-card relative flex h-[252px] w-[150px] flex-col overflow-visible rounded-2xl bg-white shadow-[0px_1px_0.5px_rgba(0,0,0,0.25)]">
      <Link
        href={`/product/${slug}`}
        className="absolute inset-0 z-0 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5C97A8] focus-visible:ring-offset-2"
        aria-label={title}
      />
      <div className="pointer-events-none absolute right-0 top-0 z-[4]">
        <Image
          src={FIGMA_PRODUCT_CARD_IMG.cardDecoR}
          alt=""
          width={CARD_CORNER_W}
          height={CARD_CORNER_H}
          className="h-[46px] w-[33px] object-contain"
        />
      </div>
      <div className="pointer-events-none absolute bottom-0 left-0 z-[4]">
        <Image
          src={FIGMA_PRODUCT_CARD_IMG.cardDecoL}
          alt=""
          width={CARD_CORNER_W}
          height={CARD_CORNER_H}
          className="h-[46px] w-[33px] object-contain"
        />
      </div>
      <div className="relative z-10 flex min-h-0 flex-1 flex-col pointer-events-none">
        <div className="flex shrink-0 justify-center px-2 pt-2 pb-2.5">
          <div className="relative size-[120px] overflow-hidden rounded-[10px]">
            <Image
              src={thumbSrc}
              alt=""
              fill
              className="object-cover"
              sizes="120px"
              unoptimized={remote}
            />
          </div>
        </div>
        <div className="flex min-h-0 flex-1 flex-col px-2.5 pb-2">
          <div className="min-h-[40px] shrink-0">
            <ProductCardTitle
              title={title}
              as={titleAs}
              className="line-clamp-2 hyphens-auto text-[16px] leading-snug text-black"
            />
          </div>
          <p className="mt-0.5 line-clamp-1 text-[12px] text-[#9C9A9A]">{subtitle}</p>
          <div className="mt-auto flex items-end justify-between gap-1 pt-1">
            <p className="text-[16px] font-semibold leading-none text-black">{price}</p>
            <div className="pointer-events-auto">
              <FigmaProductCardCartButton
                productId={productId}
                disabled={outOfStock}
                size="mobile"
              />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
