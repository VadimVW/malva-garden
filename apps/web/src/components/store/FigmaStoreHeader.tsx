"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Inter } from "next/font/google";
import { FigmaCartLink } from "@/components/ui/FigmaCartLink";
import { FigmaStoreProfileLink } from "@/components/ui/FigmaStoreProfileLink";
import { FigmaStoreSearch } from "@/components/ui/FigmaStoreSearch";
import { FIGMA_STORE_IMG, FIGMA_SOCIAL_SVG } from "@/components/store/figmaStoreAssets";
import { MalvaGardenFigmaStoreNav } from "@/components/store/MalvaGardenFigmaStoreNav";
import { phoneToTelHref } from "@/lib/storeHeaderSettings";
import { useStoreHeaderSettings } from "@/providers/StoreHeaderSettingsProvider";

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
  activeRootSlug?: string;
};

export function FigmaStoreHeader({ activeRootSlug }: Props) {
  const { phone, viberUrl, telegramUrl } = useStoreHeaderSettings();
  const telHref = phoneToTelHref(phone);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`mg-figma-header sticky top-0 z-30 hidden w-full bg-[#5C97A8] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] lg:block ${inter.className} ${scrolled ? "is-scrolled" : ""}`}
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
          <FigmaStoreSearch />
          <div className="relative flex shrink-0 items-center gap-4">
            <div className="flex gap-2.5">
              <NavIconButton label="Viber" href={viberUrl}>
                <SocialSvgImg
                  src={FIGMA_SOCIAL_SVG.viber}
                  width={18}
                  height={18}
                  className="size-[18px] object-contain"
                />
              </NavIconButton>
              <NavIconButton label="Telegram" href={telegramUrl}>
                <SocialSvgImg
                  src={FIGMA_SOCIAL_SVG.telegram}
                  width={18}
                  height={18}
                  className="size-[18px] object-contain"
                />
              </NavIconButton>
            </div>
            {telHref ? (
              <a
                href={telHref}
                className="whitespace-nowrap text-[14px] font-bold leading-none text-[#F7F4EF] hover:underline"
              >
                {phone}
              </a>
            ) : (
              <p className="whitespace-nowrap text-[14px] font-bold leading-none text-[#F7F4EF]">
                {phone}
              </p>
            )}
          </div>
          <FigmaStoreProfileLink />
          <FigmaCartLink />
        </div>
        <MalvaGardenFigmaStoreNav activeRootSlug={activeRootSlug} />
      </div>
    </header>
  );
}
