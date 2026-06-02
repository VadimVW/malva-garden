import Image from "next/image";
import Link from "next/link";
import { Inter } from "next/font/google";
import { FigmaStoreFooterDesktopContacts } from "@/components/store/FigmaStoreFooterDesktopContacts";
import { FigmaStoreFooterMobileContacts } from "@/components/store/FigmaStoreFooterMobileContacts";
import { FIGMA_STORE_IMG } from "@/components/store/figmaStoreAssets";

const inter = Inter({
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  display: "swap",
});

function FigmaStoreFooterMobile() {
  return (
    <footer className="mt-auto w-full shrink-0 bg-[#5C97A8] text-[#F7F4EF] lg:hidden">
      <div
        className={`flex flex-col gap-[10px] px-[15px] pb-4 pt-[15px] ${inter.className}`}
      >
        <div className="flex flex-col items-center">
          <Image
            src={FIGMA_STORE_IMG.logoMark}
            alt="Malva Garden"
            width={151}
            height={107}
            className="h-[107px] w-[151px] object-contain brightness-0 invert"
          />
        </div>
        <FigmaStoreFooterMobileContacts />
        <div className="flex flex-col gap-[5px] text-[14px]">
          <p className="text-[20px] font-bold">Клієнтам:</p>
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
