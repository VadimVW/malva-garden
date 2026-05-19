import Image from "next/image";
import Link from "next/link";
import { FigmaProductCardDecor } from "@/components/figma/FigmaProductCardDecor";
import { ProductCardTitle } from "@/components/figma/ProductCardTitle";

const DEFAULT_THUMB = "/images/figma/home/product-thumb.png";
/** Кругла кнопка кошика з Figma (каталог) — коло + іконка в одному SVG */
const CART_BTN_SRC = "/images/figma/catalog/cart-btn.svg";

/** Висота картки (було 346px — не вміщались 3 рядки + ціна/кошик) */
export const FIGMA_PRODUCT_CARD_HEIGHT_CLASS = "h-[384px]";

/** Рівно 3 рядки назви (25px × leading 1.15) — однакова зона для 1–3 рядків */
const TITLE_BLOCK_H = "h-[87px]";

export type FigmaProductCardProps = {
  slug: string;
  title: string;
  subtitle: string;
  price: string;
  imageUrl?: string | null;
  imageFallback?: string;
  titleAs?: "h2" | "h3";
};

export function FigmaProductCard({
  slug,
  title,
  subtitle,
  price,
  imageUrl,
  imageFallback = DEFAULT_THUMB,
  titleAs = "h2",
}: FigmaProductCardProps) {
  const thumbSrc = imageUrl || imageFallback;
  const remote = thumbSrc.startsWith("http") || thumbSrc.startsWith("data:");
  return (
    <Link
      href={`/product/${slug}`}
      className={`mg-product-card relative flex ${FIGMA_PRODUCT_CARD_HEIGHT_CLASS} w-[225px] flex-col overflow-visible rounded-2xl bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5C97A8] focus-visible:ring-offset-2`}
    >
      <div className="flex shrink-0 justify-center overflow-visible rounded-t-2xl pt-2">
        <div className="relative h-[190px] w-[190px]">
          <Image
            src={thumbSrc}
            alt=""
            width={190}
            height={190}
            className="h-full w-full rounded-lg object-cover"
            unoptimized={remote}
          />
        </div>
      </div>

      <div className="relative z-[10] flex min-h-0 flex-1 flex-col px-3 pb-7 pt-5">
        <div className={`${TITLE_BLOCK_H} shrink-0 overflow-hidden`}>
          <ProductCardTitle
            title={title}
            as={titleAs}
            className="line-clamp-3 hyphens-auto text-[25px] leading-[1.15] text-black"
          />
        </div>
        <p className="mt-1 shrink-0 line-clamp-1 text-[14px] leading-snug text-[#9C9A9A]">
          {subtitle}
        </p>
        <div className="min-h-0 flex-1" aria-hidden />
        <div className="flex shrink-0 flex-row items-end justify-between gap-2">
          <p className="min-w-0 text-[24px] font-semibold leading-none text-black">
            {price}
          </p>
          <Image
            src={CART_BTN_SRC}
            alt=""
            width={31}
            height={30}
            unoptimized
            className="h-[30px] w-[31px] shrink-0"
            aria-hidden
          />
        </div>
      </div>

      <FigmaProductCardDecor />
    </Link>
  );
}
