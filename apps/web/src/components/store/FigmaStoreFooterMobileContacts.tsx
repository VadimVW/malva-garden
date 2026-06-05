"use client";

import Image from "next/image";
import { resolveFigmaSocialSvg } from "@/components/store/figmaStoreAssets";
import { phoneToTelHref } from "@/lib/storeHeaderSettings";
import { useStoreHeaderSettings } from "@/providers/StoreHeaderSettingsProvider";

function FooterSocialLink({
  label,
  href,
  children,
}: {
  label: string;
  href: string;
  children: React.ReactNode;
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

export function FigmaStoreFooterMobileContacts() {
  const figmaSocial = resolveFigmaSocialSvg();
  const { phone, viberUrl, telegramUrl } = useStoreHeaderSettings();
  const telHref = phoneToTelHref(phone);

  return (
    <div className="flex flex-col gap-[5px] text-[14px]">
      <p className="text-[20px] font-bold">Контакти:</p>
      {telHref ? (
        <a href={telHref} className="text-[12px] font-semibold hover:underline">
          {phone}
        </a>
      ) : (
        <p className="text-[12px] font-semibold">{phone}</p>
      )}
      <div className="mt-1 flex gap-3">
        <FooterSocialLink label="Telegram" href={telegramUrl}>
          <Image
            src={figmaSocial.telegram}
            alt=""
            width={24}
            height={24}
            unoptimized
            className="size-6 object-contain"
          />
        </FooterSocialLink>
        <FooterSocialLink label="Viber" href={viberUrl}>
          <Image
            src={figmaSocial.viber}
            alt=""
            width={24}
            height={24}
            unoptimized
            className="size-6 object-contain"
          />
        </FooterSocialLink>
      </div>
    </div>
  );
}
