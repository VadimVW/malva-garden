"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { FigmaStoreFooterCustomerLinks } from "@/components/store/FigmaStoreFooterCustomerLinks";
import {
  FIGMA_SOCIAL_SVG,
  FIGMA_STORE_IMG,
} from "@/components/store/figmaStoreAssets";
import { phoneToTelHref } from "@/lib/storeHeaderSettings";
import { useStoreHeaderSettings } from "@/providers/StoreHeaderSettingsProvider";

function FooterSocialLink({
  label,
  href,
  children,
}: {
  label: string;
  href: string;
  children: ReactNode;
}) {
  if (!href.trim()) return null;
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

export function FigmaStoreFooterDesktopContacts() {
  const {
    phone,
    viberUrl,
    telegramUrl,
    youtubeUrl,
    tiktokUrl,
    facebookUrl,
    instagramUrl,
    copyright,
  } = useStoreHeaderSettings();
  const telHref = phoneToTelHref(phone);

  return (
    <>
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
          {telHref ? (
            <a href={telHref} className="text-[14px] hover:underline">
              {phone}
            </a>
          ) : (
            <p className="text-[14px]">{phone}</p>
          )}
        </div>
        <div className="flex min-w-[200px] flex-col items-center gap-3">
          <p className="w-full text-center text-[14px] font-bold">
            Ми в соцмережах
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <FooterSocialLink label="YouTube" href={youtubeUrl}>
              <SocialSvgImg
                src={FIGMA_SOCIAL_SVG.youtube}
                width={24}
                height={24}
                className="h-6 w-6 object-contain"
              />
            </FooterSocialLink>
            <FooterSocialLink label="TikTok" href={tiktokUrl}>
              <SocialSvgImg
                src={FIGMA_SOCIAL_SVG.tiktok}
                width={24}
                height={24}
                className="h-6 w-6 object-contain"
              />
            </FooterSocialLink>
            <FooterSocialLink label="Facebook" href={facebookUrl}>
              <SocialSvgImg
                src={FIGMA_SOCIAL_SVG.facebook}
                width={24}
                height={24}
                className="h-6 w-6 object-contain"
              />
            </FooterSocialLink>
            <FooterSocialLink label="Instagram" href={instagramUrl}>
              <SocialSvgImg
                src={FIGMA_SOCIAL_SVG.instagram}
                width={24}
                height={24}
                className="h-6 w-6 object-contain"
              />
            </FooterSocialLink>
            <FooterSocialLink label="Telegram" href={telegramUrl}>
              <SocialSvgImg
                src={FIGMA_SOCIAL_SVG.telegram}
                width={24}
                height={24}
                className="h-6 w-6 object-contain"
              />
            </FooterSocialLink>
            <FooterSocialLink label="Viber" href={viberUrl}>
              <SocialSvgImg
                src={FIGMA_SOCIAL_SVG.viber}
                width={24}
                height={24}
                className="h-6 w-6 object-contain"
              />
            </FooterSocialLink>
          </div>
        </div>
        <FigmaStoreFooterCustomerLinks className="flex min-w-[200px] flex-col gap-[10px] text-[14px]" />
      </div>
      {copyright.trim() ? (
        <p className="mt-6 text-center text-[12px] text-[#F7F4EF]/90">
          {copyright}
        </p>
      ) : null}
    </>
  );
}
