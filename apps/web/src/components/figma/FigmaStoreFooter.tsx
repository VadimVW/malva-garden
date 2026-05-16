import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import { FIGMA_SOCIAL_SVG, FIGMA_STORE_IMG } from "@/components/figma/figmaStoreAssets";

const inter = Inter({
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  display: "swap",
});

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

export function FigmaStoreFooter() {
  return (
    <footer className="mt-auto w-full shrink-0 bg-[#5C97A8] text-[#F7F4EF]">
      <div
        className={`mx-auto flex min-h-[280px] w-full max-w-[1280px] flex-col gap-8 px-4 pb-10 pt-6 sm:px-8 lg:px-12 ${inter.className}`}
      >
        <div className="flex flex-wrap gap-x-10 gap-y-8 lg:gap-x-16">
          <div className="flex w-[151px] flex-col gap-4">
            <Image
              src={FIGMA_STORE_IMG.logoMark}
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
          <div className="flex min-w-[200px] flex-col items-center gap-3">
            <p className="w-full text-center text-[14px] font-bold">Ми в соцмережах</p>
            <div className="flex flex-wrap justify-center gap-4">
              <FooterSocialLink label="YouTube" href="https://www.youtube.com/">
                <SocialSvgImg
                  src={FIGMA_SOCIAL_SVG.youtube}
                  width={24}
                  height={24}
                  className="h-6 w-6 object-contain"
                />
              </FooterSocialLink>
              <FooterSocialLink label="TikTok" href="https://www.tiktok.com/">
                <SocialSvgImg
                  src={FIGMA_SOCIAL_SVG.tiktok}
                  width={24}
                  height={24}
                  className="h-6 w-6 object-contain"
                />
              </FooterSocialLink>
              <FooterSocialLink label="Facebook" href="https://www.facebook.com/">
                <SocialSvgImg
                  src={FIGMA_SOCIAL_SVG.facebook}
                  width={24}
                  height={24}
                  className="h-6 w-6 object-contain"
                />
              </FooterSocialLink>
              <FooterSocialLink label="Instagram" href="https://www.instagram.com/">
                <SocialSvgImg
                  src={FIGMA_SOCIAL_SVG.instagram}
                  width={24}
                  height={24}
                  className="h-6 w-6 object-contain"
                />
              </FooterSocialLink>
              <FooterSocialLink label="Telegram" href="https://t.me/malvagarden">
                <SocialSvgImg
                  src={FIGMA_SOCIAL_SVG.telegram}
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
  );
}
