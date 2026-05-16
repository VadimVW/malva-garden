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
import { Inter, Montserrat_Alternates } from "next/font/google";
import { FigmaCartLink } from "@/components/figma/FigmaCartLink";
import { MalvaGardenFigmaStoreNav } from "@/components/figma/MalvaGardenFigmaStoreNav";
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
  cartIcon: "/images/figma/home/cart.svg",
  galleryRef: "/images/figma/product/gallery-ref.png",
  truck: "/images/figma/product/Truck.svg",
} as const;

const SOCIAL_SVG = {
  youtube: "/images/figma/home/youtube.svg",
  tiktok: "/images/figma/home/tiktok.svg",
  facebook: "/images/figma/home/facebook.svg",
  instagram: "/images/figma/home/instagram.svg",
  telegram: "/images/figma/home/telegram.svg",
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
            <Link href="/" className="relative flex shrink-0 items-center gap-3">
              <Image
                src={IMG.logoMark}
                alt="Malva Garden"
                width={97}
                height={69}
                className="h-[69px] w-[97px] object-contain brightness-0 invert"
              />
            </Link>
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
          <MalvaGardenFigmaStoreNav
            activeSection={figmaNavSectionFromCategorySlug(p.category?.slug)}
          />
        </div>
      </header>

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
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
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
