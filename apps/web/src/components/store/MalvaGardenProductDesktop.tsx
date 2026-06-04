/**
 * Figma: сторінка товару (desktop), файл Malva Garden — верстка за повноекранним скріном макету.
 * Прод: `/product/[slug]` передає `product` з API.
 *
 * Ассети:
 * — `/images/figma/product/gallery-ref.png` — референс-експорт зі скріну; для продакшену замініть на окремі кропи головного фото та мініатюр з Figma.
 */

import Image from "next/image";
import Link from "next/link";
import { Montserrat_Alternates } from "next/font/google";
import { FigmaStoreFooter } from "@/components/store/FigmaStoreFooter";
import { FigmaStoreHeader } from "@/components/store/FigmaStoreHeader";
import { productCategoryBreadcrumbLinks } from "@/lib/figmaCatalogLinks";
import { ProductFigmaBuyBlock } from "@/components/store/product/ProductFigmaBuyBlock";
import type { GalleryImage } from "@/components/store/product/ProductFigmaGallery";
import { ProductFigmaGallery } from "@/components/store/product/ProductFigmaGallery";
import { ProductFigmaTabs } from "@/components/store/product/ProductFigmaTabs";

const montserratAlternates = Montserrat_Alternates({
  weight: ["400", "600", "700"],
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  display: "swap",
});

const IMG = {
  galleryRef: "/images/figma/product/gallery-ref.png",
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



export default function MalvaGardenProductDesktop({
  product = DEMO_PRODUCT,
  preview = false,
  categoryBreadcrumbs,
  activeRootSlug,
}: {
  product?: MalvaGardenProductPayload;
  preview?: boolean;
  categoryBreadcrumbs?: { name: string; slug: string }[];
  activeRootSlug?: string;
}) {
  const p = product;
  const priceLabel = p.price.includes("грн") ? p.price : `${p.price} грн`;
  const categoryCrumbLinks = categoryBreadcrumbs?.length
    ? productCategoryBreadcrumbLinks(categoryBreadcrumbs)
    : [{ label: "Каталог", href: "/catalog" }];

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-visible bg-[#F5F5F5]">
      <FigmaStoreHeader activeRootSlug={activeRootSlug} />


      <div
        className={`flex flex-1 flex-col bg-[#F5F5F5] ${montserratAlternates.className}`}
      >
        <div className="flex w-full justify-center px-4 pb-16 pt-6 sm:px-8 lg:px-12">
          <div className="mg-figma-content-panel px-5 pb-12 pt-8 sm:px-8">
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
              {categoryCrumbLinks.map((crumb) => (
                <span key={crumb.href} className="inline-flex items-center gap-x-2">
                  <span className="text-[#9C9A9A]">/</span>
                  <Link href={crumb.href} className="hover:underline">
                    {crumb.label}
                  </Link>
                </span>
              ))}
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
                  <ProductFigmaBuyBlock
                    productId={p.id}
                    stockQuantity={p.stockQuantity}
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
