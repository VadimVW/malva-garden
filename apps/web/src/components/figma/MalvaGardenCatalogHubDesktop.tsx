/**
 * Hub каталогу: вибір одного з трьох розділів магазину (§7.13.4).
 * Маршрут: `/catalog` (підключення в `app/catalog/page.tsx` — крок 4.2).
 */

import Image from "next/image";
import Link from "next/link";
import { FigmaStoreFooter } from "@/components/figma/FigmaStoreFooter";
import { FigmaStoreHeader } from "@/components/figma/FigmaStoreHeader";
import { Montserrat_Alternates } from "next/font/google";

const montserratAlternates = Montserrat_Alternates({
  weight: ["400", "600", "700"],
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  display: "swap",
});

const CATALOG_HOME_BTN = "/images/figma/catalog/home-btn.svg";
const ARROW_RIGHT = "/images/figma/catalog/arrow-right-btn.svg";

export const CATALOG_HUB_SECTIONS = [
  {
    href: "/catalog/kvity",
    title: "Квіти",
    description: "Однорічні, багаторічні, хризантеми та інші культури для саду й балкону",
    imageSrc: "/images/figma/catalog/hero-kvity.png",
    imageClassName: "object-cover object-[center_22%]",
  },
  {
    href: "/catalog/dekoratyvni-kushi",
    title: "Декоративні кущі",
    description: "Гортензії, троянди, клематиси та інші кущі для ландшафту",
    imageSrc: "/images/figma/home/banner-bg.png",
    imageClassName: "object-cover object-center",
  },
  {
    href: "/catalog/dekoratyvni-travy",
    title: "Декоративні трави",
    description: "Трави та злаки для клумб, бордюрів і природних композицій",
    imageSrc: "/images/figma/home/banner-bg.png",
    imageClassName: "object-cover object-[center_60%]",
  },
] as const;

function CatalogHubSectionCard({
  href,
  title,
  description,
  imageSrc,
  imageClassName,
}: (typeof CATALOG_HUB_SECTIONS)[number]) {
  return (
    <Link
      href={href}
      className="mg-product-card group flex min-h-[280px] flex-col overflow-hidden rounded-2xl bg-white shadow-[0px_4px_16px_rgba(0,0,0,0.08)] transition-shadow hover:shadow-[0px_8px_24px_rgba(92,151,168,0.2)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5C97A8] focus-visible:ring-offset-2"
    >
      <div className="relative h-[160px] w-full shrink-0 overflow-hidden bg-[#E7F1F3]">
        <Image
          src={imageSrc}
          alt=""
          fill
          className={imageClassName}
          sizes="(max-width: 1200px) 100vw, 380px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" aria-hidden />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-[22px] font-bold leading-tight text-black">{title}</h2>
          <Image
            src={ARROW_RIGHT}
            alt=""
            width={16}
            height={16}
            unoptimized
            className="mt-1 shrink-0 transition-transform group-hover:translate-x-0.5"
            aria-hidden
          />
        </div>
        <p className="text-[14px] leading-snug text-[#5C5C5C]">{description}</p>
      </div>
    </Link>
  );
}

export default function MalvaGardenCatalogHubDesktop() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-visible bg-[#F5F5F5]">
      <FigmaStoreHeader />

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
              <span className="inline-flex items-center gap-2">
                <span className="text-[#9C9A9A]" aria-hidden>
                  /
                </span>
                <span className="font-semibold text-black">Каталог</span>
              </span>
            </nav>

            <header className="mb-8 text-center sm:text-left">
              <h1 className="text-[28px] font-bold leading-tight text-black sm:text-[32px]">
                Оберіть розділ каталогу
              </h1>
              <p className="mt-2 max-w-[640px] text-[15px] leading-snug text-[#5C5C5C]">
                Оберіть категорію, щоб
                переглянути товари.
              </p>
            </header>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3" role="list">
              {CATALOG_HUB_SECTIONS.map((section) => (
                <div key={section.href} role="listitem">
                  <CatalogHubSectionCard {...section} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <FigmaStoreFooter />
      </div>
    </div>
  );
}
