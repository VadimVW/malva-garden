"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { FigmaStoreFooterCustomerLinks } from "@/components/store/FigmaStoreFooterCustomerLinks";
import { FigmaStoreFooterLegalLines } from "@/components/store/FigmaStoreFooterLegalLines";
import {
  LOGO_MARK_INTRINSIC,
  resolveFigmaSocialSvg,
  resolveFigmaStoreImg,
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
  const figmaImg = resolveFigmaStoreImg();
  const figmaSocial = resolveFigmaSocialSvg();
  const {
    phone,
    contactEmail,
    viberUrl,
    telegramUrl,
    youtubeUrl,
    tiktokUrl,
    facebookUrl,
    instagramUrl,
  } = useStoreHeaderSettings();
  const telHref = phoneToTelHref(phone);
  const email = contactEmail.trim();

  return (
    <div className="grid w-full flex-1 grid-cols-[1fr_auto_1fr] items-start gap-x-24 gap-y-8">
      <div className="flex min-h-full flex-col justify-between justify-self-end self-stretch">
        <div className="flex gap-x-16 items-start">
          <Image
            src={figmaImg.logoMark}
            alt="Malva Garden"
            width={LOGO_MARK_INTRINSIC.width}
            height={LOGO_MARK_INTRINSIC.height}
            sizes="151px"
            quality={90}
            className="h-auto w-[151px] shrink-0 object-contain brightness-0 invert"
          />
          <div className="flex min-w-[140px] flex-col gap-2">
            <p className="text-[14px] font-bold">Контакти:</p>
            {telHref ? (
              <a href={telHref} className="text-[14px] hover:underline">
                {phone}
              </a>
            ) : (
              <p className="text-[14px]">{phone}</p>
            )}
            {email ? (
              <a href={`mailto:${email}`} className="text-[14px] hover:underline">
                {email}
              </a>
            ) : null}
          </div>
        </div>
        <FigmaStoreFooterLegalLines className="whitespace-nowrap text-left" />
      </div>
      <div className="flex min-w-[200px] flex-col items-center gap-3">
        <p className="w-full text-center text-[14px] font-bold">
          Ми в соцмережах
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <FooterSocialLink label="YouTube" href={youtubeUrl}>
            <SocialSvgImg
              src={figmaSocial.youtube}
              width={24}
              height={24}
              className="h-6 w-6 object-contain"
            />
          </FooterSocialLink>
          <FooterSocialLink label="TikTok" href={tiktokUrl}>
            <SocialSvgImg
              src={figmaSocial.tiktok}
              width={24}
              height={24}
              className="h-6 w-6 object-contain"
            />
          </FooterSocialLink>
          <FooterSocialLink label="Facebook" href={facebookUrl}>
            <SocialSvgImg
              src={figmaSocial.facebook}
              width={24}
              height={24}
              className="h-6 w-6 object-contain"
            />
          </FooterSocialLink>
          <FooterSocialLink label="Instagram" href={instagramUrl}>
            <SocialSvgImg
              src={figmaSocial.instagram}
              width={24}
              height={24}
              className="h-6 w-6 object-contain"
            />
          </FooterSocialLink>
          <FooterSocialLink label="Telegram" href={telegramUrl}>
            <SocialSvgImg
              src={figmaSocial.telegram}
              width={24}
              height={24}
              className="h-6 w-6 object-contain"
            />
          </FooterSocialLink>
          <FooterSocialLink label="Viber" href={viberUrl}>
            <SocialSvgImg
              src={figmaSocial.viber}
              width={24}
              height={24}
              className="h-6 w-6 object-contain"
            />
          </FooterSocialLink>
        </div>
      </div>
      <FigmaStoreFooterCustomerLinks className="flex min-w-[200px] flex-col gap-[10px] justify-self-start text-[14px]" />
    </div>
  );
}
