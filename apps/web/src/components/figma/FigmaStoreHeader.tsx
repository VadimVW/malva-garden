"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Inter } from "next/font/google";
import { FigmaCartLink } from "@/components/figma/FigmaCartLink";
import { FIGMA_STORE_IMG, FIGMA_SOCIAL_SVG } from "@/components/figma/figmaStoreAssets";
import { MalvaGardenFigmaStoreNav } from "@/components/figma/MalvaGardenFigmaStoreNav";
import type { FigmaStoreNavSection } from "@/lib/figmaStoreNavSection";

const inter = Inter({
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  display: "swap",
});

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

type Props = {
  activeNavSection?: FigmaStoreNavSection;
};

export function FigmaStoreHeader({ activeNavSection }: Props) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`mg-figma-header sticky top-0 z-30 w-full bg-[#5C97A8] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] ${inter.className} ${scrolled ? "is-scrolled" : ""}`}
    >
      <div className="pointer-events-none absolute inset-0 z-[1] opacity-40">
        <Image
          src={FIGMA_STORE_IMG.headerTexture}
          alt=""
          fill
          className="object-cover object-center"
          sizes="100vw"
          priority
        />
      </div>
      <div className="relative z-[2] flex flex-col overflow-visible">
        <div className="mg-header-top relative mx-auto flex w-full max-w-[1280px] items-center gap-4 px-4 sm:gap-6 sm:px-8 lg:gap-[30px] lg:px-12 xl:px-16">
          <div className="mg-header-logo-wrap relative flex shrink-0 items-center">
            <Link href="/" className="inline-flex">
              <Image
                src={FIGMA_STORE_IMG.logoMark}
                alt="Malva Garden"
                width={97}
                height={69}
                className="mg-header-logo object-contain brightness-0 invert"
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
                  src={FIGMA_SOCIAL_SVG.telegram}
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
            className="mg-header-profile relative inline-flex size-12 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/5 text-[#F7F4EF] transition-colors hover:bg-white/15"
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
  );
}
