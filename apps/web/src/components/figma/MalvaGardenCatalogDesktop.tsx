/**
 * Figma: файл CVhUngm9zTzqlNWpvKnfed, node 47:157 (каталог) — https://www.figma.com/design/CVhUngm9zTzqlNWpvKnfed/Untitled?node-id=47-157
 *
 * Верстка звірена з повноекранним скріном макету (крихти, банер, сортування, сітка, пагінація, випадаюче меню «Квіти»).
 * Точні px з Dev Mode / MCP за потреби підженіть окремо.
 *
 * Ассети:
 * — `/images/figma/catalog/home-btn.svg` — крихти.
 * — `/images/figma/catalog/hero-kvity.png` — скрін сторінки; для банера краще окремий кроп лише hero з Figma (зараз `object-position` підганяє кадр).
 */

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { CatalogGridFade } from "@/components/figma/CatalogGridFade";
import { CatalogPaginationNav } from "@/components/figma/CatalogPaginationNav";
import { FigmaStoreFooter } from "@/components/figma/FigmaStoreFooter";
import { FigmaStoreHeader } from "@/components/figma/FigmaStoreHeader";
import { FigmaProductCardDecor } from "@/components/figma/FigmaProductCardDecor";
import type { CatalogPaginationMeta } from "@/lib/catalogPagination";
import type { FigmaStoreNavSection } from "@/lib/figmaStoreNavSection";
import { Montserrat_Alternates } from "next/font/google";

const montserratAlternates = Montserrat_Alternates({
  weight: ["400", "600", "700"],
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  display: "swap",
});

const IMG = {
  productThumb: "/images/figma/home/product-thumb.png",
  cartIcon: "/images/figma/home/cart.svg",
  /** Повна сторінка зі скріну; object-position підганяє видиму зону космосів під банер */
  heroKvity: "/images/figma/catalog/hero-kvity.png",
} as const;


/** Іконка з `public/images/figma/catalog/home-btn.svg` (не з MCP JSON). */
const CATALOG_HOME_BTN = "/images/figma/catalog/home-btn.svg";

export type CatalogGridProduct = {
  slug: string;
  name: string;
  price: string;
  stockQuantity: number;
  subtitle?: string;
  imageUrl?: string | null;
};

export type CatalogBreadcrumbItem = { label: string; href?: string };

type CatalogDesktopProps = {
  gridProducts?: CatalogGridProduct[] | null;
  sectionTitle?: string;
  sectionDescription?: string;
  breadcrumbs?: CatalogBreadcrumbItem[];
  activeNavSection?: FigmaStoreNavSection;
  paginationBasePath?: string;
  pagination?: CatalogPaginationMeta | null;
};

type CatalogCardModel = {
  slug: string | null;
  title: string;
  subtitle: string;
  price: string;
  imageUrl: string | null;
};

function catalogCardsFromProps(
  gridProducts: CatalogGridProduct[] | null | undefined,
): CatalogCardModel[] {
  if (!gridProducts?.length) return [];
  return gridProducts.map((p) => ({
    slug: p.slug,
    title: p.name,
    subtitle: p.subtitle ?? "У каталозі",
    price: p.price.includes("грн") ? p.price : `${p.price} грн`,
    imageUrl: p.imageUrl ?? null,
  }));
}



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


export default function MalvaGardenCatalogDesktop({
  gridProducts,
  sectionTitle = "Квіти",
  sectionDescription = "Відбірні товари для вашого саду та дому",
  breadcrumbs,
  activeNavSection = "flowers",
  paginationBasePath,
  pagination,
}: CatalogDesktopProps) {
  const gridCards = catalogCardsFromProps(gridProducts ?? null);
  const crumbTrail: CatalogBreadcrumbItem[] = breadcrumbs ?? [{ label: "Квіти" }];
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-visible bg-[#F5F5F5]">
      <FigmaStoreHeader activeNavSection={activeNavSection} />


      <div
        className={`flex flex-1 flex-col bg-[#F5F5F5] ${montserratAlternates.className}`}
      >
        <div className="flex w-full justify-center px-4 pb-12 pt-6 sm:px-8 lg:px-12">
          <div className="flex w-full max-w-[1200px] flex-col bg-[#E7F1F3] px-5 pb-12 pt-8 sm:px-8">
            <nav
              className="mb-6 flex flex-wrap items-center gap-2 text-[12px] leading-none"
              aria-label="Навігаційні крихти"
            >
              <Link
                href="/"
                className="inline-flex items-center text-[#5E8F98] hover:underline"
                aria-label="Головна"
              >
                <Image
                  src={CATALOG_HOME_BTN}
                  alt=""
                  width={13}
                  height={14}
                  unoptimized
                  className="shrink-0"
                />
              </Link>
              {crumbTrail.map((c, i) => {
                const last = i === crumbTrail.length - 1;
                return (
                  <span key={`${c.label}-${i}`} className="inline-flex items-center gap-2">
                    <span className="text-[#9C9A9A]" aria-hidden>
                      /
                    </span>
                    {last || !c.href ? (
                      <span
                        className={
                          last ? "font-semibold text-black" : "text-[#5E8F98]"
                        }
                      >
                        {c.label}
                      </span>
                    ) : (
                      <Link href={c.href} className="text-[#5E8F98] hover:underline">
                        {c.label}
                      </Link>
                    )}
                  </span>
                );
              })}
            </nav>

            <section className="mb-8 w-full" aria-label="Банер категорії">
              <div className="relative min-h-[280px] w-full overflow-hidden rounded-2xl shadow-[0px_4px_16px_rgba(0,0,0,0.08)]">
                <Image
                  src={IMG.heroKvity}
                  alt=""
                  fill
                  className="object-cover object-[center_22%]"
                  sizes="(max-width: 1200px) 100vw, 1200px"
                  priority
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/[0.06] p-4">
                  <div className="flex max-w-[min(100%,480px)] flex-col items-center rounded-2xl bg-white px-8 py-6 text-center shadow-[0px_8px_24px_rgba(0,0,0,0.1)]">
                    <p className="text-[26px] font-bold leading-tight text-black">
                      {sectionTitle}
                    </p>
                    <p className="mt-1 text-[14px] leading-snug text-black">
                      {sectionDescription}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <main className="flex w-full flex-col" aria-labelledby="catalog-heading">
              <div className="mb-6 flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h1
                  id="catalog-heading"
                  className="text-left text-[24px] font-bold leading-none text-black"
                >
                  {sectionTitle}
                </h1>
                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <span className="text-[14px] font-semibold text-black">Сортування:</span>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full bg-[#5C97A8] px-4 py-2 text-[12px] font-bold text-[#F7F4EF] shadow-[0px_2px_8px_rgba(92,151,168,0.35)]"
                    aria-haspopup="listbox"
                    aria-expanded="false"
                  >
                    Від дешевих до дорогих
                    <svg className="size-3 shrink-0" viewBox="0 0 12 12" fill="none" aria-hidden>
                      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </div>

              <CatalogGridFade
                page={pagination?.page ?? 1}
                className="grid w-full grid-cols-1 justify-items-center gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3"
              >
                {gridCards.length === 0 && (
                  <p className="col-span-full py-16 text-center text-[16px] text-[#5C5C5C]">
                    У цій категорії поки немає товарів.
                  </p>
                )}
                {gridCards.map((c) => {
                  const thumbSrc = c.imageUrl || IMG.productThumb;
                  const remote = thumbSrc.startsWith("http");
                  const inner = (
                    <>
                      <div className="flex justify-center overflow-visible rounded-t-2xl pt-2">
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
                      <div className="relative z-[10] flex min-h-0 flex-1 flex-row items-end justify-between gap-2 px-3 pb-4 pt-3">
                        <div className="flex min-w-0 flex-1 flex-col gap-1">
                          <h2 className="text-[25px] leading-none text-black">{c.title}</h2>
                          <p className="text-[14px] text-[#9C9A9A]">{c.subtitle}</p>
                          <p className="pt-1 text-[24px] font-semibold leading-none text-black">
                            {c.price}
                          </p>
                        </div>
                        <span
                          className="relative z-[10] flex size-9 shrink-0 items-center justify-center rounded-full bg-[#5C97A8] text-white shadow-[0px_2px_6px_rgba(92,151,168,0.45)]"
                          aria-hidden
                        >
                          <SocialSvgImg
                            src={IMG.cartIcon}
                            width={32}
                            height={31}
                            className="h-[18px] w-[18px] object-contain"
                          />
                        </span>
                      </div>
                      <FigmaProductCardDecor />
                    </>
                  );
                  const shellClass =
                    "mg-product-card relative flex h-[346px] w-[225px] flex-col overflow-visible rounded-2xl bg-white";
                  return (
                    <Link
                      key={c.slug}
                      href={`/product/${c.slug}`}
                      className={`${shellClass} block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5C97A8] focus-visible:ring-offset-2`}
                    >
                      {inner}
                    </Link>
                  );
                })}
              </CatalogGridFade>

              {paginationBasePath && pagination && pagination.totalPages > 0 ? (
                <CatalogPaginationNav
                  basePath={paginationBasePath}
                  pagination={pagination}
                />
              ) : null}
            </main>
          </div>
        </div>

        <FigmaStoreFooter />
      </div>
    </div>
  );
}
