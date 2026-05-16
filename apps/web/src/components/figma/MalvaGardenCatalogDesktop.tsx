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
import { FigmaCartLink } from "@/components/figma/FigmaCartLink";
import { MalvaGardenFigmaStoreNav } from "@/components/figma/MalvaGardenFigmaStoreNav";
import type { CatalogPaginationMeta } from "@/lib/catalogPagination";
import type { FigmaStoreNavSection } from "@/lib/figmaStoreNavSection";
import {
  Inter,
  Montserrat_Alternates,
} from "next/font/google";

const inter = Inter({
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  display: "swap",
});

const montserratAlternates = Montserrat_Alternates({
  weight: ["400", "600", "700"],
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  display: "swap",
});

const IMG = {
  logoMark: "/images/figma/home/logo-mark.png",
  headerTexture: "/images/figma/home/header-texture.png",
  productThumb: "/images/figma/home/product-thumb.png",
  cartIcon: "/images/figma/home/cart.svg",
  cardDecoL: "/images/figma/home/card-deco-left.png",
  cardDecoR: "/images/figma/home/card-deco-right.png",
  cardDecoHover1: "/images/figma/home/card-deco-hover1.png",
  cardDecoHover2: "/images/figma/home/card-deco-hover2.png",
  /** Повна сторінка зі скріну; object-position підганяє видиму зону космосів під банер */
  heroKvity: "/images/figma/catalog/hero-kvity.png",
} as const;

const SOCIAL_SVG = {
  youtube: "/images/figma/home/youtube.svg",
  tiktok: "/images/figma/home/tiktok.svg",
  facebook: "/images/figma/home/facebook.svg",
  instagram: "/images/figma/home/instagram.svg",
  telegram: "/images/figma/home/telegram.svg",
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

function FooterSocialLink({
  label,
  href,
  children,
}: {
  label: string;
  href: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex size-6 items-center justify-center text-[#F7F4EF] transition-opacity hover:opacity-80"
      aria-label={label}
    >
      {children}
    </a>
  );
}

function NavIconButton({
  label,
  href,
  children,
}: {
  label: string;
  href: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex size-[30px] shrink-0 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/30 text-[#F7F4EF] transition-colors hover:bg-white/25"
      aria-label={label}
    >
      {children}
    </a>
  );
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

const CARD_CORNER_W = 33;
const CARD_CORNER_H = 46;
const HOVER1_IMG_W = 36;
const HOVER1_IMG_H = 23;
const HOVER2_IMG_W = 77;
const HOVER2_IMG_H = 11;
const SIDE_HOVER2_GAP_FROM_CORNER = 37;
const HOVER2_TOP_INSET = 11;
const HOVER2_RIGHT_INSET = 5;
const SIDE_HOVER2_LEFT_BOTTOM = CARD_CORNER_H + SIDE_HOVER2_GAP_FROM_CORNER;
const SIDE_HOVER2_RIGHT_TOP = CARD_CORNER_H + SIDE_HOVER2_GAP_FROM_CORNER;

function FigmaProductCardDecor() {
  const hoverImgClass = "block h-auto w-auto max-w-none object-contain";
  const edgeHover2Slot = { width: HOVER2_IMG_H, height: HOVER2_IMG_W } as const;

  return (
    <>
      <div className="pointer-events-none absolute right-0 top-0 z-[4] opacity-95">
        <Image
          src={IMG.cardDecoR}
          alt=""
          width={CARD_CORNER_W}
          height={CARD_CORNER_H}
          className="h-[46px] w-[33px] object-contain"
        />
      </div>
      <div className="pointer-events-none absolute bottom-0 left-0 z-[4] opacity-95">
        <Image
          src={IMG.cardDecoL}
          alt=""
          width={CARD_CORNER_W}
          height={CARD_CORNER_H}
          className="h-[46px] w-[33px] object-contain"
        />
      </div>
      <div
        className="pointer-events-none absolute bottom-0 z-[3] opacity-95"
        style={{ left: CARD_CORNER_W }}
        aria-hidden
      >
        <Image
          src={IMG.cardDecoHover1}
          alt=""
          width={HOVER1_IMG_W}
          height={HOVER1_IMG_H}
          unoptimized
          className={hoverImgClass}
        />
      </div>
      <div
        className="pointer-events-none absolute top-0 z-[3] opacity-95"
        style={{ right: CARD_CORNER_W }}
        aria-hidden
      >
        <Image
          src={IMG.cardDecoHover1}
          alt=""
          width={HOVER1_IMG_W}
          height={HOVER1_IMG_H}
          unoptimized
          className={`${hoverImgClass} ml-auto -scale-x-100 -scale-y-100`}
        />
      </div>
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 z-[1] -translate-x-1/2 opacity-95"
        aria-hidden
      >
        <Image
          src={IMG.cardDecoHover2}
          alt=""
          width={HOVER2_IMG_W}
          height={HOVER2_IMG_H}
          unoptimized
          className={hoverImgClass}
        />
      </div>
      <div
        className="pointer-events-none absolute left-1/2 z-[1] -translate-x-1/2 opacity-95"
        style={{ top: HOVER2_TOP_INSET }}
        aria-hidden
      >
        <Image
          src={IMG.cardDecoHover2}
          alt=""
          width={HOVER2_IMG_W}
          height={HOVER2_IMG_H}
          unoptimized
          className={hoverImgClass}
          style={{ transform: "scaleY(-1)", transformOrigin: "center top" }}
        />
      </div>
      <div
        className="pointer-events-none absolute left-0 z-[1] overflow-visible opacity-95"
        style={{ bottom: SIDE_HOVER2_LEFT_BOTTOM, width: edgeHover2Slot.width }}
        aria-hidden
      >
        <div
          className="absolute items-end justify-center overflow-visible"
          style={{ height: edgeHover2Slot.height, left: -38, top: -10 }}
        >
          <Image
            src={IMG.cardDecoHover2}
            alt=""
            width={HOVER2_IMG_W}
            height={HOVER2_IMG_H}
            unoptimized
            className={`${hoverImgClass} shrink-0`}
            style={{
              transform: "rotate(-90deg) scaleY(-1)",
              transformOrigin: "center bottom",
            }}
          />
        </div>
      </div>
      <div
        className="pointer-events-none absolute z-[1] overflow-visible opacity-95"
        style={{
          top: SIDE_HOVER2_RIGHT_TOP,
          right: HOVER2_RIGHT_INSET,
          width: edgeHover2Slot.width,
        }}
        aria-hidden
      >
        <div
          className="flex items-start justify-center overflow-visible"
          style={{ height: edgeHover2Slot.height }}
        >
          <Image
            src={IMG.cardDecoHover2}
            alt=""
            width={HOVER2_IMG_W}
            height={HOVER2_IMG_H}
            unoptimized
            className={`${hoverImgClass} shrink-0`}
            style={{
              transform: "rotate(90deg) scaleY(-1)",
              transformOrigin: "center top",
            }}
          />
        </div>
      </div>
    </>
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
      <header
        className={`sticky top-0 z-30 w-full bg-[#5C97A8] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] ${inter.className}`}
      >
        <div className="pointer-events-none absolute inset-0 z-[1] opacity-40">
          <Image
            src={IMG.headerTexture}
            alt=""
            fill
            className="object-cover object-center"
            sizes="100vw"
            priority
          />
        </div>
        <div className="relative z-[2] flex flex-col overflow-visible">
          <div className="relative mx-auto flex h-[95px] w-full max-w-[1280px] items-center gap-4 px-4 pb-2 pt-[18px] sm:gap-6 sm:px-8 lg:gap-[30px] lg:px-12 xl:px-16">
            <div className="relative flex h-[69px] w-[97px] shrink-0 items-center">
              <Link href="/" className="inline-flex">
                <Image
                  src={IMG.logoMark}
                  alt="Malva Garden"
                  width={97}
                  height={69}
                  className="h-[69px] w-[97px] object-contain brightness-0 invert"
                />
              </Link>
            </div>
            <div
              className="relative flex h-[34px] min-w-0 flex-1 items-center gap-2.5 rounded-full border border-[#F7F4EF] px-2"
              style={{ paddingTop: 5, paddingBottom: 5 }}
            >
              <svg
                className="size-5 shrink-0 text-[#F7F4EF]/50"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3-3" strokeLinecap="round" />
              </svg>
              <span className="truncate text-[12px] leading-none text-[#F7F4EF]/50">
                Пошук
              </span>
            </div>
            <div className="relative flex shrink-0 items-center gap-4">
              <div className="flex gap-2.5">
                <NavIconButton label="WhatsApp" href="https://wa.me/380672589828">
                  <svg
                    className="size-[18px]"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </NavIconButton>
                <NavIconButton label="Telegram" href="https://t.me/malvagarden">
                  <SocialSvgImg
                    src={SOCIAL_SVG.telegram}
                    width={18}
                    height={18}
                    className="size-[18px] object-contain"
                  />
                </NavIconButton>
              </div>
              <p className="whitespace-nowrap text-[14px] font-bold leading-none text-[#F7F4EF]">
                +380 67 258 98 28
              </p>
            </div>
            <a
              href="#"
              className="relative inline-flex size-12 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/5 text-[#F7F4EF] transition-colors hover:bg-white/15"
              aria-label="Профіль"
            >
              <svg
                className="size-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </a>
            <FigmaCartLink />
          </div>
          <MalvaGardenFigmaStoreNav activeSection={activeNavSection} />
        </div>
      </header>

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
                  <div className="flex max-w-[min(100%,480px)] items-center gap-4 rounded-2xl bg-white px-8 py-6 shadow-[0px_8px_24px_rgba(0,0,0,0.1)]">
                    <Image
                      src={IMG.logoMark}
                      alt=""
                      width={36}
                      height={26}
                      className="h-[34px] w-[48px] shrink-0 object-contain opacity-[0.35] grayscale"
                    />
                    <div>
                      <p className="text-[26px] font-bold leading-tight text-black">
                        {sectionTitle}
                      </p>
                      <p className="mt-1 text-[14px] leading-snug text-[#5a5a5a]">
                        {sectionDescription}
                      </p>
                    </div>
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

        <footer className="mt-auto w-full shrink-0 bg-[#5C97A8] text-[#F7F4EF]">
          <div
            className={`mx-auto flex min-h-[280px] w-full max-w-[1280px] flex-col gap-8 px-4 pb-10 pt-6 sm:px-8 lg:px-12 ${inter.className}`}
          >
            <div className="flex flex-wrap gap-x-10 gap-y-8 lg:gap-x-16">
              <div className="flex w-[151px] flex-col gap-4">
                <Image
                  src={IMG.logoMark}
                  alt="Malva Garden"
                  width={120}
                  height={85}
                  className="h-auto w-[120px] object-contain brightness-0 invert"
                />
              </div>
              <div className="flex min-w-[140px] flex-col gap-2">
                <p className="text-[14px] font-bold">Контакти:</p>
                <p className="text-[14px]">+380 67 258 98 28</p>
              </div>
              <div className="flex min-w-[200px] flex-col gap-3">
                <p className="text-[14px] font-bold">Ми в соцмережах</p>
                <div className="flex flex-wrap gap-4">
                  <FooterSocialLink label="YouTube" href="https://www.youtube.com/">
                    <SocialSvgImg
                      src={SOCIAL_SVG.youtube}
                      width={24}
                      height={24}
                      className="h-6 w-6 object-contain"
                    />
                  </FooterSocialLink>
                  <FooterSocialLink label="TikTok" href="https://www.tiktok.com/">
                    <SocialSvgImg
                      src={SOCIAL_SVG.tiktok}
                      width={24}
                      height={24}
                      className="h-6 w-6 object-contain"
                    />
                  </FooterSocialLink>
                  <FooterSocialLink label="Facebook" href="https://www.facebook.com/">
                    <SocialSvgImg
                      src={SOCIAL_SVG.facebook}
                      width={24}
                      height={24}
                      className="h-6 w-6 object-contain"
                    />
                  </FooterSocialLink>
                  <FooterSocialLink label="Instagram" href="https://www.instagram.com/">
                    <SocialSvgImg
                      src={SOCIAL_SVG.instagram}
                      width={24}
                      height={24}
                      className="h-6 w-6 object-contain"
                    />
                  </FooterSocialLink>
                  <FooterSocialLink label="Telegram" href="https://t.me/malvagarden">
                    <SocialSvgImg
                      src={SOCIAL_SVG.telegram}
                      width={24}
                      height={24}
                      className="h-6 w-6 object-contain"
                    />
                  </FooterSocialLink>
                  <FooterSocialLink label="WhatsApp" href="https://wa.me/380672589828">
                    <svg
                      className="h-6 w-6"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </FooterSocialLink>
                </div>
              </div>
              <div className="flex min-w-[200px] flex-col gap-[10px] text-[14px]">
                <p className="font-bold">Клієнтам:</p>
                <Link className="hover:underline" href="/pages/dostavka-ta-oplata">
                  Доставка та оплата
                </Link>
                <Link className="hover:underline" href="/pages/povernennya">
                  Повернення товару
                </Link>
                <Link className="hover:underline" href="/pages/publichna-oferta">
                  Публічна оферта
                </Link>
                <Link className="hover:underline" href="/pages/konfidenciynist">
                  Політика конфіденційності
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
