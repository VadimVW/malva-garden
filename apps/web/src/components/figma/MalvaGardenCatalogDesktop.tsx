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
import { CatalogGridFade } from "@/components/figma/CatalogGridFade";
import { CatalogPaginationNav } from "@/components/figma/CatalogPaginationNav";
import { CatalogSortSelect } from "@/components/figma/CatalogSortSelect";
import { FigmaStoreFooter } from "@/components/figma/FigmaStoreFooter";
import { FigmaStoreHeader } from "@/components/figma/FigmaStoreHeader";
import { FigmaProductCard } from "@/components/figma/FigmaProductCard";
import type {
  CatalogPaginationMeta,
  CatalogUrlQuery,
} from "@/lib/catalogPagination";
import type { FigmaStoreNavSection } from "@/lib/figmaStoreNavSection";
import { Montserrat_Alternates } from "next/font/google";

const montserratAlternates = Montserrat_Alternates({
  weight: ["400", "600", "700"],
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  display: "swap",
});

const IMG = {
  /** Повна сторінка зі скріну; object-position підганяє видиму зону космосів під банер */
  heroKvity: "/images/figma/catalog/hero-kvity.png",
} as const;

const HERO_FALLBACK_BY_SECTION: Record<FigmaStoreNavSection, string> = {
  flowers: IMG.heroKvity,
  shrubs: IMG.heroKvity,
  herbs: IMG.heroKvity,
};


/** Іконка з `public/images/figma/catalog/home-btn.svg` (не з MCP JSON). */
const CATALOG_HOME_BTN = "/images/figma/catalog/home-btn.svg";

export type CatalogGridProduct = {
  id: string;
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
  /** URL банера з API (`Category.bannerImageUrl`); fallback — статичний hero */
  bannerImageUrl?: string | null;
  /** Текст на банері (необовʼязково). Без `bannerTitle` і `bannerSubtitle` — лише зображення */
  bannerTitle?: string | null;
  bannerSubtitle?: string | null;
  breadcrumbs?: CatalogBreadcrumbItem[];
  activeNavSection?: FigmaStoreNavSection;
  paginationBasePath?: string;
  pagination?: CatalogPaginationMeta | null;
  paginationQuery?: CatalogUrlQuery;
  showCategoryBanner?: boolean;
  emptyGridMessage?: string;
};

function resolveBannerOverlay(
  bannerTitle: string | null | undefined,
  bannerSubtitle: string | null | undefined,
  sectionTitle: string,
  sectionDescription: string,
): { show: boolean; title: string; subtitle: string } {
  const hasExplicitBannerFields =
    bannerTitle !== undefined || bannerSubtitle !== undefined;

  if (hasExplicitBannerFields) {
    const title = bannerTitle?.trim() ?? "";
    const subtitle = bannerSubtitle?.trim() ?? "";
    return {
      show: Boolean(title || subtitle),
      title,
      subtitle,
    };
  }

  return {
    show: true,
    title: sectionTitle,
    subtitle: sectionDescription,
  };
}

type CatalogCardModel = {
  productId: string;
  slug: string | null;
  title: string;
  subtitle: string;
  price: string;
  imageUrl: string | null;
  stockQuantity: number;
};

function catalogCardsFromProps(
  gridProducts: CatalogGridProduct[] | null | undefined,
): CatalogCardModel[] {
  if (!gridProducts?.length) return [];
  return gridProducts.map((p) => ({
    productId: p.id,
    slug: p.slug,
    title: p.name,
    subtitle: p.subtitle ?? "У каталозі",
    price: p.price.includes("грн") ? p.price : `${p.price} грн`,
    imageUrl: p.imageUrl ?? null,
    stockQuantity: p.stockQuantity,
  }));
}

export default function MalvaGardenCatalogDesktop({
  gridProducts,
  sectionTitle = "Квіти",
  sectionDescription = "Відбірні товари для вашого саду та дому",
  bannerImageUrl,
  bannerTitle,
  bannerSubtitle,
  breadcrumbs,
  activeNavSection = "flowers",
  paginationBasePath,
  pagination,
  paginationQuery,
  showCategoryBanner = true,
  emptyGridMessage = "У цій категорії поки немає товарів.",
}: CatalogDesktopProps) {
  const gridCards = catalogCardsFromProps(gridProducts ?? null);
  const crumbTrail: CatalogBreadcrumbItem[] = breadcrumbs ?? [{ label: "Квіти" }];
  const bannerOverlay = resolveBannerOverlay(
    bannerTitle,
    bannerSubtitle,
    sectionTitle,
    sectionDescription,
  );
  const bannerSrc =
    bannerImageUrl?.trim() || HERO_FALLBACK_BY_SECTION[activeNavSection];
  const bannerRemote =
    bannerSrc.startsWith("http") || bannerSrc.startsWith("data:");
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

            {showCategoryBanner ? (
              <section className="mb-8 w-full" aria-label="Банер категорії">
                <div className="relative min-h-[280px] w-full overflow-hidden rounded-2xl shadow-[0px_4px_16px_rgba(0,0,0,0.08)]">
                  <Image
                    src={bannerSrc}
                    alt={bannerOverlay.title || sectionTitle}
                    fill
                    className="object-cover object-[center_22%]"
                    sizes="(max-width: 1200px) 100vw, 1200px"
                    priority
                    unoptimized={bannerRemote}
                  />
                  {bannerOverlay.show ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/[0.06] p-4">
                      <div className="flex max-w-[min(100%,480px)] flex-col items-center rounded-2xl bg-white px-8 py-6 text-center shadow-[0px_8px_24px_rgba(0,0,0,0.1)]">
                        {bannerOverlay.title ? (
                          <p className="text-[26px] font-bold leading-tight text-black">
                            {bannerOverlay.title}
                          </p>
                        ) : null}
                        {bannerOverlay.subtitle ? (
                          <p
                            className={`text-[14px] leading-snug text-black ${
                              bannerOverlay.title ? "mt-1" : ""
                            }`}
                          >
                            {bannerOverlay.subtitle}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </div>
              </section>
            ) : null}

            <main className="flex w-full flex-col" aria-labelledby="catalog-heading">
              <div className="mb-6 flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h1
                  id="catalog-heading"
                  className="text-left text-[24px] font-bold leading-none text-black"
                >
                  {sectionTitle}
                </h1>
                {paginationBasePath ? (
                  <CatalogSortSelect basePath={paginationBasePath} />
                ) : null}
              </div>

              <CatalogGridFade
                page={pagination?.page ?? 1}
                className="grid w-full grid-cols-[repeat(auto-fill,225px)] justify-center gap-x-8 gap-y-10"
              >
                {gridCards.length === 0 && (
                  <p className="col-span-full py-16 text-center text-[16px] text-[#5C5C5C]">
                    {emptyGridMessage}
                  </p>
                )}
                {gridCards.map((c) => (
                  <FigmaProductCard
                    key={c.slug}
                    productId={c.productId}
                    slug={c.slug!}
                    title={c.title}
                    subtitle={c.subtitle}
                    price={c.price}
                    stockQuantity={c.stockQuantity}
                    imageUrl={c.imageUrl}
                    titleAs="h2"
                  />
                ))}
              </CatalogGridFade>

              {paginationBasePath && pagination && pagination.totalPages > 0 ? (
                <CatalogPaginationNav
                  basePath={paginationBasePath}
                  pagination={pagination}
                  query={paginationQuery}
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
