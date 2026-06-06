import Image from "next/image";
import { Inter } from "next/font/google";
import { FigmaStoreFooterCustomerLinks } from "@/components/store/FigmaStoreFooterCustomerLinks";
import { FigmaStoreFooterDesktopContacts } from "@/components/store/FigmaStoreFooterDesktopContacts";
import { FigmaStoreFooterLegalLines } from "@/components/store/FigmaStoreFooterLegalLines";
import { FigmaStoreFooterMobileContacts } from "@/components/store/FigmaStoreFooterMobileContacts";
import {
  LOGO_MARK_INTRINSIC,
  resolveFigmaStoreImg,
} from "@/components/store/figmaStoreAssets";

const inter = Inter({
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  display: "swap",
});

function FigmaStoreFooterMobile() {
  const figmaImg = resolveFigmaStoreImg();

  return (
    <footer className="mt-auto w-full shrink-0 bg-[#5C97A8] text-[#F7F4EF] lg:hidden">
      <div
        className={`flex flex-col gap-[10px] px-[15px] pb-4 pt-[15px] ${inter.className}`}
      >
        <div className="flex flex-col items-center">
          <Image
            src={figmaImg.logoMark}
            alt="Malva Garden"
            width={LOGO_MARK_INTRINSIC.width}
            height={LOGO_MARK_INTRINSIC.height}
            sizes="151px"
            quality={90}
            className="h-[107px] w-[151px] object-contain brightness-0 invert"
          />
        </div>
        <FigmaStoreFooterMobileContacts />
        <FigmaStoreFooterCustomerLinks
          className="flex flex-col gap-[5px] text-[14px]"
          titleClassName="text-[20px] font-bold"
        />
        <FigmaStoreFooterLegalLines className="mt-4" />
      </div>
    </footer>
  );
}

function FigmaStoreFooterDesktop() {
  return (
    <footer className="mt-auto hidden w-full shrink-0 bg-[#5C97A8] text-[#F7F4EF] lg:block">
      <div
        className={`mx-auto flex min-h-[280px] w-full max-w-[1280px] flex-col px-4 pb-10 pt-6 sm:px-8 lg:px-12 ${inter.className}`}
      >
        <FigmaStoreFooterDesktopContacts />
      </div>
    </footer>
  );
}

export function FigmaStoreFooter({
  variant,
}: {
  variant?: "desktop" | "mobile";
} = {}) {
  if (variant === "mobile") return <FigmaStoreFooterMobile />;
  if (variant === "desktop") return <FigmaStoreFooterDesktop />;
  return (
    <>
      <FigmaStoreFooterMobile />
      <FigmaStoreFooterDesktop />
    </>
  );
}
