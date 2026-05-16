import Image from "next/image";
import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Inter, Montserrat_Alternates } from "next/font/google";
import { MalvaGardenFigmaStoreNav } from "@/components/figma/MalvaGardenFigmaStoreNav";
import type { FigmaBreadcrumbItem } from "@/components/figma/figmaPageTypes";
import type { FigmaStoreNavSection } from "@/lib/figmaStoreNavSection";

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
} as const;

const SOCIAL_SVG = {
  youtube: "/images/figma/home/youtube.svg",
  tiktok: "/images/figma/home/tiktok.svg",
  facebook: "/images/figma/home/facebook.svg",
  instagram: "/images/figma/home/instagram.svg",
  telegram: "/images/figma/home/telegram.svg",
} as const;

const CATALOG_HOME_BTN = "/images/figma/catalog/home-btn.svg";

export const figmaInputClass =
  "w-full rounded-xl border border-[#c5d8dc] bg-white px-4 py-3 text-[14px] text-black outline-none transition-shadow placeholder:text-[#9C9A9A] focus:border-[#5C97A8] focus:ring-2 focus:ring-[#5C97A8]/25";

export function FigmaPrimaryButton({
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-xl bg-[#2f6f4e] px-6 py-3.5 text-[15px] font-bold text-white shadow-[0px_4px_12px_rgba(47,111,78,0.35)] transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function FigmaSecondaryLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center rounded-xl border-2 border-[#5C97A8] bg-white px-6 py-3 text-[15px] font-semibold text-[#5C97A8] transition-colors hover:bg-[#E7F1F3] ${className}`}
    >
      {children}
    </Link>
  );
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

function FigmaBreadcrumbs({ items }: { items: FigmaBreadcrumbItem[] }) {
  return (
    <nav
      className="mb-8 flex flex-wrap items-center gap-2 text-[12px] leading-none"
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
      {items.map((c, i) => {
        const last = i === items.length - 1;
        return (
          <span key={`${c.label}-${i}`} className="inline-flex items-center gap-2">
            <span className="text-[#9C9A9A]" aria-hidden>
              /
            </span>
            {last || !c.href ? (
              <span className={last ? "font-semibold text-black" : "text-[#5E8F98]"}>
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
  );
}

type MalvaGardenFigmaPageShellProps = {
  breadcrumbs: FigmaBreadcrumbItem[];
  title: string;
  subtitle?: string;
  activeNavSection?: FigmaStoreNavSection;
  children: ReactNode;
};

export function MalvaGardenFigmaPageShell({
  breadcrumbs,
  title,
  subtitle,
  activeNavSection,
  children,
}: MalvaGardenFigmaPageShellProps) {
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
            <Link
              href="/cart"
              className="relative z-10 flex h-12 w-[119px] shrink-0 items-center gap-3 overflow-hidden rounded-[5px] px-2 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]"
            >
              <SocialSvgImg
                src={IMG.cartIcon}
                width={32}
                height={31}
                className="h-8 w-8 shrink-0 object-contain"
              />
              <span className="text-[12px] font-bold text-[#F7F4EF]">Кошик</span>
            </Link>
          </div>
          <MalvaGardenFigmaStoreNav activeSection={activeNavSection} />
        </div>
      </header>

      <div
        className={`flex flex-1 flex-col bg-[#F5F5F5] ${montserratAlternates.className}`}
      >
        <div className="flex w-full justify-center px-4 pb-12 pt-6 sm:px-8 lg:px-12">
          <div className="flex w-full max-w-[1200px] flex-col bg-[#E7F1F3] px-5 pb-12 pt-8 sm:px-8">
            <FigmaBreadcrumbs items={breadcrumbs} />
            <header className="mb-8">
              <h1 className="text-[28px] font-bold leading-tight text-black sm:text-[32px]">
                {title}
              </h1>
              {subtitle ? (
                <p className="mt-2 text-[14px] leading-snug text-[#5a5a5a]">{subtitle}</p>
              ) : null}
            </header>
            {children}
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
                <Link className="hover:underline" href="/pages/kontakty">
                  Контакти
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
