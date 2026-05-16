/**
 * Figma: сторінка товару (desktop), файл Malva Garden — верстка за повноекранним скріном макету.
 * Прев’ю: `/figma-preview/product`. Прод: `/product/[slug]` передає `product` з API.
 *
 * Ассети:
 * — `/images/figma/product/gallery-ref.png` — референс-експорт зі скріну; для продакшену замініть на окремі кропи головного фото та мініатюр з Figma.
 */

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Montserrat_Alternates } from "next/font/google";
import { FigmaStoreFooter } from "@/components/figma/FigmaStoreFooter";
import { FigmaStoreHeader } from "@/components/figma/FigmaStoreHeader";
import {
  catalogCategoryHref,
  catalogHubCrumb,
  categorySlugMatchesHub,
} from "@/lib/figmaCatalogLinks";
import { figmaNavSectionFromCategorySlug } from "@/lib/figmaStoreNavSection";
import { ProductFigmaBuyBlock } from "@/components/figma/product/ProductFigmaBuyBlock";
import type { GalleryImage } from "@/components/figma/product/ProductFigmaGallery";
import { ProductFigmaGallery } from "@/components/figma/product/ProductFigmaGallery";
import { ProductFigmaTabs } from "@/components/figma/product/ProductFigmaTabs";

const montserratAlternates = Montserrat_Alternates({
  weight: ["400", "600", "700"],
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  display: "swap",
});

const IMG = {
  logoMark: "/images/figma/home/logo-mark.png",
  cartIcon: "/images/figma/home/cart.svg",
  galleryRef: "/images/figma/product/gallery-ref.png",
  truck: "/images/figma/product/Truck.svg",
} as const;


const CATALOG_HOME_BTN = "/images/figma/catalog/home-btn.svg";

export type MalvaGardenProductPayload = {
  id: string;
  name: string;
  slug: string;
  price: string;
  stockQuantity: number;
  description: string | null;
  careDescription: string | null;
  category: { name: string; slug: string } | null;
  images: GalleryImage[];
};

const DESCRIPTION_PLACEHOLDER = `Сорт «Нічне небо» вирізняється насиченим фіолетово-космічним забарвленням віночка з білими крапками, що нагадують зоряне небо. Рослина компактна, добре гілкується й рясно цвіте з ранньої весни до пізньої осені.

Петунія добре переносить український клімат, любить сонячні місця та регулярний полив без застою води. Ідеально підходить для балконних ящиків, підвісних кашпо та клумб.

Період цвітіння — з травня до жовтня за умови своєчасного видалення відцвілів і підживлення комплексними добривами для квітучих рослин.`;

const DEMO_PRODUCT: MalvaGardenProductPayload = {
  id: "00000000-0000-0000-0000-000000000001",
  name: "Петунія «Нічне небо» (Night Sky)",
  slug: "preview",
  price: "51",
  stockQuantity: 12,
  description: DESCRIPTION_PLACEHOLDER,
  careDescription: "Полив помірний, уникати перезволоження. Підживлення 1–2 рази на місяць.",
  category: { name: "Квіти", slug: "kvity" },
  images: [],
};



function SocialSvgImg({
  src,
  width,
  height,
  className,
}: {
  src: string;
  width: number;
  height: number;
  className?: string;
}) {
  return (
    <Image
      src={src}
      alt=""
      width={width}
      height={height}
      unoptimized
      className={className}
    />
  );
}

export default function MalvaGardenProductDesktop({
  product = DEMO_PRODUCT,
  preview = false,
}: {
  product?: MalvaGardenProductPayload;
  preview?: boolean;
}) {
  const p = product;
  const priceLabel = p.price.includes("грн") ? p.price : `${p.price} грн`;
  const inStock = p.stockQuantity > 0;
  const hub = catalogHubCrumb(p.category?.slug);
  const showCategoryCrumb =
    Boolean(p.category) && !categorySlugMatchesHub(p.category?.slug);

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-visible bg-[#F5F5F5]">
      <FigmaStoreHeader
        activeNavSection={figmaNavSectionFromCategorySlug(p.category?.slug)}
      />


      <div
        className={`flex flex-1 flex-col bg-[#F5F5F5] ${montserratAlternates.className}`}
      >
        <div className="flex w-full justify-center px-4 pb-16 pt-6 sm:px-8 lg:px-12">
          <div className="flex w-full max-w-[1200px] flex-col bg-[#E7F1F3] px-5 pb-12 pt-8 sm:px-8">
            <nav
              className="mb-8 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] leading-snug text-[#5E8F98]"
              aria-label="Навігаційні крихти"
            >
              <Link href="/" className="inline-flex shrink-0 items-center hover:underline" aria-label="Головна">
                <Image
                  src={CATALOG_HOME_BTN}
                  alt=""
                  width={13}
                  height={14}
                  unoptimized
                  className="shrink-0"
                />
              </Link>
              <span className="text-[#9C9A9A]">/</span>
              <Link href={hub.href} className="hover:underline">
                {hub.label}
              </Link>
              {showCategoryCrumb && p.category ? (
                <>
                  <span className="text-[#9C9A9A]">/</span>
                  <Link
                    href={catalogCategoryHref(p.category.slug)}
                    className="hover:underline"
                  >
                    {p.category.name}
                  </Link>
                </>
              ) : null}
              <span className="text-[#9C9A9A]">/</span>
              <span className="font-semibold text-black">{p.name}</span>
            </nav>

            <div className="flex w-full flex-col gap-10 lg:flex-row lg:items-start lg:gap-12">
              <ProductFigmaGallery
                images={p.images}
                fallbackSrc={IMG.galleryRef}
                productName={p.name}
              />

              <div className="flex min-w-0 flex-1 flex-col gap-6">
                <section className="rounded-2xl bg-white p-6 shadow-[0px_6px_20px_rgba(0,0,0,0.08)]">
                  <h1 className="text-[22px] font-bold leading-snug text-black lg:text-[24px]">
                    {p.name}
                  </h1>
                  <p className="mt-4 text-[22px] font-bold text-black">{priceLabel}</p>
                  {inStock ? (
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
                      Є в наявності
                    </div>
                  ) : (
                    <div className="mt-4 text-[14px] font-semibold text-[#b91c1c]">
                      Немає в наявності
                    </div>
                  )}
                  <div className="mt-3 flex items-start gap-2 text-[13px] leading-snug text-[#5a5a5a]">
                    <SocialSvgImg
                      src={IMG.truck}
                      width={16}
                      height={16}
                      className="mt-0.5 size-4 shrink-0 object-contain"
                    />
                    Безкоштовна доставка від 500 грн
                  </div>
                  <ProductFigmaBuyBlock
                    productId={p.id}
                    maxQty={p.stockQuantity}
                    preview={preview}
                  />
                  {!preview ? null : (
                    <p className="mt-2 text-center text-[12px] text-[#5a5a5a]">
                      На сторінці прев’ю кошик не підключається до API.
                    </p>
                  )}
                </section>

                <ProductFigmaTabs
                  description={p.description}
                  careDescription={p.careDescription}
                />
              </div>
            </div>
          </div>
        </div>

        <FigmaStoreFooter />
      </div>
    </div>
  );
}
