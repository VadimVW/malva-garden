/**
 * Figma: сторінка товару (desktop), файл Malva Garden — верстка за повноекранним скріном макету.
 * Прев’ю: `/figma-preview/product`. Інтеграція з `/product/[slug]` — окремий крок.
 *
 * Ассети:
 * — `/images/figma/product/gallery-ref.png` — референс-експорт зі скріну; для продакшену замініть на окремі кропи головного фото та мініатюр з Figma.
 */

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Inter, Montserrat_Alternates } from "next/font/google";

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

const PRODUCT_TITLE =
  "Петунія «Нічне небо» (Night Sky)";

const DESCRIPTION_PLACEHOLDER = `Сорт «Нічне небо» вирізняється насиченим фіолетово-космічним забарвленням віночка з білими крапками, що нагадують зоряне небо. Рослина компактна, добре гілкується й рясно цвіте з ранньої весни до пізньої осені.

Петунія добре переносить український клімат, любить сонячні місця та регулярний полив без застою води. Ідеально підходить для балконних ящиків, підвісних кашпо та клумб.

Період цвітіння — з травня до жовтня за умови своєчасного видалення відцвілів і підживлення комплексними добривами для квітучих рослин.`;

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

export default function MalvaGardenProductDesktop() {
  return (
    <div className="relative w-full max-w-[1200px] bg-white">
      <header
        className={`absolute left-0 right-0 top-0 z-20 w-full max-w-[1200px] bg-[#5C97A8] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] ${inter.className}`}
      >
        <div className="pointer-events-none absolute inset-0 z-[1] opacity-40">
          <Image
            src={IMG.headerTexture}
            alt=""
            fill
            className="object-cover object-center"
            sizes="(max-width: 1200px) 100vw, 1200px"
            priority
          />
        </div>
        <div className="relative z-[2] flex flex-col">
          <div className="relative flex h-[95px] items-center gap-[30px] px-[100px] pb-2 pt-[18px]">
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
            <div className="relative h-12 w-[119px] shrink-0 overflow-hidden rounded-[5px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
              <div className="relative z-10 flex h-full w-full items-center gap-3 px-2">
                <SocialSvgImg
                  src={IMG.cartIcon}
                  width={32}
                  height={31}
                  className="h-8 w-8 shrink-0 object-contain"
                />
                <span className="text-[12px] font-bold text-[#F7F4EF]">Кошик</span>
              </div>
            </div>
          </div>
          <nav className="relative z-[2] flex h-[44px] min-h-[44px] w-full shrink-0 flex-nowrap items-stretch justify-center gap-0 bg-transparent px-[100px] py-0">
            <div
              className="pointer-events-none absolute inset-0 z-0 bg-[#548a9d]/35"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-black/[0.04] to-black/[0.12]"
              aria-hidden
            />
            <Link
              href="/catalog"
              className="relative z-10 flex h-full min-w-[130px] flex-1 items-center justify-center px-3 text-center text-[12px] font-bold leading-tight text-[#F7F4EF] transition-colors hover:bg-[#4C8094]/30 sm:flex-initial"
            >
              Декоративні кущі
            </Link>
            <span className="relative z-10 flex h-full min-w-[130px] flex-1 items-center justify-center bg-[#4C8094]/45 px-3 text-center text-[12px] font-bold leading-tight text-[#F7F4EF] sm:flex-initial">
              Квіти
            </span>
            <Link
              href="/catalog"
              className="relative z-10 flex h-full min-w-[130px] flex-1 items-center justify-center px-3 text-center text-[12px] font-bold leading-tight text-[#F7F4EF] transition-colors hover:bg-[#4C8094]/30 sm:flex-initial"
            >
              Декоративні трави
            </Link>
          </nav>
        </div>
      </header>

      <div
        className={`flex min-h-[1100px] w-full flex-col bg-white pt-[139px] ${montserratAlternates.className}`}
      >
        <div className="flex w-full justify-center bg-[#F5F5F5] px-[100px] pb-16">
          <div className="flex w-full max-w-[1000px] flex-col bg-[#E7F1F3] px-6 pb-12 pt-8">
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
              <Link href="/catalog" className="hover:underline">
                Каталог
              </Link>
              <span className="text-[#9C9A9A]">/</span>
              <Link href="/catalog" className="hover:underline">
                Насіння квітів
              </Link>
              <span className="text-[#9C9A9A]">/</span>
              <Link href="/catalog/kvity/odnorichni" className="hover:underline">
                Однорічні
              </Link>
              <span className="text-[#9C9A9A]">/</span>
              <span className="font-semibold text-black">{PRODUCT_TITLE}</span>
            </nav>

            <div className="flex w-full flex-col gap-10 lg:flex-row lg:items-start lg:gap-12">
              <div className="w-full shrink-0 lg:max-w-[440px] lg:flex-1">
                <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-white shadow-[0px_6px_20px_rgba(0,0,0,0.08)]">
                  <Image
                    src={IMG.galleryRef}
                    alt=""
                    fill
                    className="object-cover object-[center_38%]"
                    sizes="(max-width: 1024px) 100vw, 440px"
                    priority
                  />
                </div>
                <div className="mt-4 flex gap-3">
                  {[0, 1, 2].map((i) => (
                    <button
                      key={i}
                      type="button"
                      className="relative size-[72px] shrink-0 overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-black/5"
                      aria-label={`Мініатюра ${i + 1}`}
                    >
                      <Image
                        src={IMG.galleryRef}
                        alt=""
                        fill
                        className="object-cover object-[center_38%]"
                        sizes="72px"
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-6">
                <section className="rounded-2xl bg-white p-6 shadow-[0px_6px_20px_rgba(0,0,0,0.08)]">
                  <h1 className="text-[22px] font-bold leading-snug text-black lg:text-[24px]">
                    {PRODUCT_TITLE}
                  </h1>
                  <p className="mt-4 text-[22px] font-bold text-black">51 грн</p>
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
                  <div className="mt-3 flex items-start gap-2 text-[13px] leading-snug text-[#5a5a5a]">
                    <SocialSvgImg
                      src={IMG.truck}
                      width={16}
                      height={16}
                      className="mt-0.5 size-4 shrink-0 object-contain"
                    />
                    Безкоштовна доставка від 500 грн
                  </div>
                  <div className="mt-6 flex flex-wrap items-center gap-4">
                    <span className="text-[14px] font-semibold text-black">Кількість:</span>
                    <div className="inline-flex items-center rounded-lg bg-[#E8E8E8] p-1">
                      <button
                        type="button"
                        className="inline-flex size-9 items-center justify-center rounded-md text-lg font-medium text-[#5C97A8] transition-colors hover:bg-white"
                        aria-label="Менше"
                      >
                        −
                      </button>
                      <span className="min-w-[2rem] text-center text-[15px] font-semibold text-black">
                        1
                      </span>
                      <button
                        type="button"
                        className="inline-flex size-9 items-center justify-center rounded-md text-lg font-medium text-[#5C97A8] transition-colors hover:bg-white"
                        aria-label="Більше"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#2f6f4e] py-3.5 text-[15px] font-bold text-white shadow-[0px_4px_12px_rgba(47,111,78,0.35)] transition-opacity hover:opacity-95"
                  >
                    <SocialSvgImg
                      src={IMG.cartIcon}
                      width={22}
                      height={21}
                      className="h-[22px] w-[22px] object-contain brightness-0 invert"
                    />
                    Додати в кошик
                  </button>
                </section>

                <section className="rounded-2xl bg-white p-6 shadow-[0px_6px_20px_rgba(0,0,0,0.08)]">
                  <div className="flex gap-8 border-b border-[#E0E0E0] text-[15px] font-bold">
                    <span className="-mb-px border-b-2 border-[#5C97A8] pb-3 text-black">
                      Опис
                    </span>
                    <span className="pb-3 text-[#9C9A9A]">Догляд</span>
                  </div>
                  <div className="mt-5 space-y-4 text-[14px] leading-relaxed text-[#333333]">
                    {DESCRIPTION_PLACEHOLDER.split("\n\n").map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-auto w-full bg-[#5C97A8] text-[#F7F4EF]">
          <div
            className={`mx-auto flex min-h-[280px] w-full max-w-[1200px] flex-col gap-8 bg-[#5C97A8] px-[100px] pb-10 pt-6 ${inter.className}`}
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
