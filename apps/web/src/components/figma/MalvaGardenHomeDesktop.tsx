/**
 * Верстка з Figma: Desktop id=1:61 (файл CVhUngm9zTzqlNWpvKnfed).
 * Оновлено під візуальне порівняння з макетом (герой зліва, 3 таби, футер, картка з фото).
 *
 * public/images/figma/home/ — додайте також:
 *   product-thumb.png   — фото товару на картці (190×190), експорт з макету.
 */

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { FigmaStoreFooter } from "@/components/figma/FigmaStoreFooter";
import { FigmaStoreHeader } from "@/components/figma/FigmaStoreHeader";
import { FigmaProductCardDecor } from "@/components/figma/FigmaProductCardDecor";
import {
  Montserrat_Alternates,
  Playfair_Display,
} from "next/font/google";

const montserratAlternates = Montserrat_Alternates({
  weight: ["400", "600", "700"],
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  display: "swap",
});

const playfair = Playfair_Display({
  weight: ["400", "700"],
  style: ["italic", "normal"],
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const IMG = {
  banner: "/images/figma/home/banner-bg.png",
  logoMark: "/images/figma/home/logo-mark.png",
  productThumb: "/images/figma/home/product-thumb.png",
  cartIcon: "/images/figma/home/cart.svg",
} as const;


export type HomeLeaderProduct = {
  slug: string;
  name: string;
  subtitle: string;
  price: string;
  imageUrl?: string | null;
};

type HomeProps = {
  leaderProducts?: HomeLeaderProduct[] | null;
};

function leaderCardsFromProps(
  leaderProducts: HomeLeaderProduct[] | null | undefined,
) {
  if (!leaderProducts?.length) return [];
  return leaderProducts.map((p) => ({
    slug: p.slug,
    title: p.name,
    subtitle: p.subtitle,
    price: p.price.includes("грн") ? p.price : `${p.price} грн`,
    imageUrl: p.imageUrl ?? null,
  }));
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


export default function MalvaGardenHomeDesktop({ leaderProducts }: HomeProps) {
  const cards = leaderCardsFromProps(leaderProducts ?? null);
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-visible bg-[#F5F5F5]">
      <FigmaStoreHeader />


      <div
        className={`flex flex-1 flex-col bg-[#F5F5F5] ${montserratAlternates.className}`}
      >
        <div className="flex w-full justify-center px-4 pb-8 pt-6 sm:px-8 lg:px-12">
          <main className="flex w-full max-w-[1200px] flex-col items-center gap-2.5 bg-[#E7F1F3] px-4 pb-14 pt-10 sm:px-6">
            <section className="flex w-full flex-col items-center px-2.5 pb-6 pt-0">
              <div className="w-full max-w-[1120px]">
                <div className="relative w-full overflow-hidden rounded-2xl">
                  <div className="relative aspect-[980/423] w-full min-h-[200px]">
                    <Image
                      src={IMG.banner}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="980px"
                      priority
                    />
                    {/* з макету: текст зліва на банері, «Malva Garden» — акцентним serif */}
                    <div className="absolute inset-0 flex items-center">
                      <div className="flex max-w-[420px] flex-col gap-4 px-6 py-10 pl-8 sm:pl-12">
                        <p className="text-left text-[25px] leading-snug text-[#F7F4EF]">
                          Створи сад мрії <br />
                          разом з{" "}
                          <span
                            className={`${playfair.className} text-[26px] italic text-[#F7F4EF]`}
                          >
                            Malva Garden
                          </span>
                        </p>
                        <Link
                          href="/catalog/kvity"
                          className="mg-btn-light inline-flex w-fit items-center gap-2.5 rounded-lg bg-white py-2.5 pl-4 pr-5"
                        >
                          <span className="text-[20px] text-black">До каталогу</span>
                          <span className="text-[18px] leading-none text-black" aria-hidden>
                            →
                          </span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Градієнт симетричний відносно 50% (золото / центр #B6A150) */}
                <div
                  className="mt-[25px] h-px w-full shrink-0 bg-[linear-gradient(90deg,rgba(255,255,255,0)_5%,#E9CF66_25%,#B6A150_50%,#E9CF66_75%,rgba(255,255,255,0)_95%)]"
                  aria-hidden
                />
              </div>
            </section>

            <section className="flex w-full flex-col px-2.5 pt-6">
              <div className="flex w-full max-w-[1120px] flex-col items-center gap-6 py-4 pb-4 pt-[15px]">
                <h2 className="text-center text-[24px] font-bold leading-none text-black">
                  Лідери продажу:
                </h2>
                <div className="flex w-full flex-wrap items-center justify-center gap-x-[60px] gap-y-8 rounded-2xl bg-[rgba(231,241,243,0.46)] px-3 py-[15px] sm:gap-x-[80px] lg:gap-x-[100px]">
                  {cards.length === 0 && (
                    <p className="w-full py-8 text-center text-[16px] text-[#5C5C5C]">
                      Товари зʼявляться після підключення каталогу.
                    </p>
                  )}
                  {cards.map((c) => {
                    const thumbSrc = c.imageUrl || IMG.productThumb;
                    const remote =
                      thumbSrc.startsWith("http") || thumbSrc.startsWith("data:");
                    const inner = (
                      <>
                        <div className="flex justify-center overflow-visible rounded-t-2xl pt-2">
                          <div className="relative h-[190px] w-[190px]">
                            <Image
                              src={thumbSrc}
                              alt=""
                              width={190}
                              height={190}
                              className="h-full w-full rounded-lg object-cover"
                              unoptimized={remote}
                            />
                          </div>
                        </div>
                        <div className="relative z-[10] flex min-h-0 flex-1 flex-row items-end justify-between gap-2 px-3 pb-4 pt-3">
                          <div className="flex min-w-0 flex-1 flex-col gap-1">
                            <h3 className="text-[25px] leading-none text-black">{c.title}</h3>
                            <p className="text-[14px] text-[#9C9A9A]">{c.subtitle}</p>
                            <p className="pt-1 text-[24px] font-semibold leading-none text-black">
                              {c.price}
                            </p>
                          </div>
                          <span
                            className="relative z-[10] flex size-9 shrink-0 items-center justify-center rounded-full bg-[#5C97A8] text-white shadow-[0px_2px_6px_rgba(92,151,168,0.45)]"
                            aria-hidden
                          >
                            <SocialSvgImg
                              src={IMG.cartIcon}
                              width={32}
                              height={31}
                              className="h-[18px] w-[18px] object-contain"
                            />
                          </span>
                        </div>
                        <FigmaProductCardDecor />
                      </>
                    );
                    const shellClass =
                      "mg-product-card relative flex h-[346px] w-[225px] flex-col overflow-visible rounded-2xl bg-white";
                    return (
                      <Link
                        key={c.slug}
                        href={`/product/${c.slug}`}
                        className={`${shellClass} block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5C97A8] focus-visible:ring-offset-2`}
                      >
                        {inner}
                      </Link>
                    );
                  })}
                </div>
                <div className="flex h-10 w-[225px] items-center justify-center rounded-lg bg-white px-2 py-2 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
                  <span className="text-[14px] text-black">Показати більше</span>
                </div>
              </div>
            </section>
          </main>
        </div>

        <FigmaStoreFooter />
      </div>
    </div>
  );
}
