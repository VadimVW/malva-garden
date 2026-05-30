"use client";

import Image from "next/image";
import Link from "next/link";
import { Inter } from "next/font/google";
import { FigmaStoreSearch } from "@/components/ui/FigmaStoreSearch";
import { FIGMA_STORE_IMG } from "@/components/store/figmaStoreAssets";

const inter = Inter({
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  display: "swap",
});

export function MobileStoreHeader() {
  return (
    <header
      className={`fixed left-0 right-0 top-0 z-40 h-[var(--mg-mobile-header-h)] bg-[#5C97A8] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] lg:hidden ${inter.className}`}
    >
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <Image
          src={FIGMA_STORE_IMG.headerTexture}
          alt=""
          fill
          className="object-cover object-center"
          sizes="100vw"
          priority
        />
      </div>
      <div className="relative z-[1] flex h-full items-end gap-[15px] px-[15px] pb-2 pt-6">
        <Link href="/" className="relative shrink-0">
          <Image
            src={FIGMA_STORE_IMG.logoMark}
            alt="Malva Garden"
            width={80}
            height={57}
            className="h-[57px] w-[80px] object-contain brightness-0 invert"
            priority
          />
        </Link>
        <FigmaStoreSearch variant="mobile" />
      </div>
    </header>
  );
}
