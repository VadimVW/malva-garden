/**
 * Mobile home — Figma node 1:70 (file CVhUngm9zTzqlNWpvKnfed).
 */

import Image from "next/image";
import Link from "next/link";
import {
  Montserrat_Alternates,
  Playfair_Display,
} from "next/font/google";
import { FigmaStoreFooter } from "@/components/store/FigmaStoreFooter";
import { FigmaProductCardMobile } from "@/components/store/mobile/FigmaProductCardMobile";
import type { CatalogHubSectionContent } from "@/lib/catalogTree";
import type { HomeLeaderProduct } from "@/components/store/MalvaGardenHomeDesktop";

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

const BANNER = "/images/figma/home/banner-bg.png";

type Props = {
  leaderProducts?: HomeLeaderProduct[] | null;
  hubSections?: CatalogHubSectionContent[];
};

function leaderCardsFromProps(
  leaderProducts: HomeLeaderProduct[] | null | undefined,
) {
  if (!leaderProducts?.length) return [];
  return leaderProducts.map((p) => ({
    productId: p.id,
    slug: p.slug,
    title: p.name,
    subtitle: p.subtitle,
    price: p.price.includes("грн") ? p.price : `${p.price} грн`,
    imageUrl: p.imageUrl ?? null,
    stockQuantity: p.stockQuantity,
  }));
}

export default function MalvaGardenHomeMobile({
  leaderProducts,
  hubSections = [],
}: Props) {
  const cards = leaderCardsFromProps(leaderProducts ?? null);

  return (
    <div
      className={`flex min-h-screen w-full flex-col bg-[#F5F5F5] lg:hidden ${montserratAlternates.className}`}
    >
      <section className="relative flex h-[379px] w-full flex-col items-center justify-center gap-[30px] overflow-hidden py-[50px]">
        <div aria-hidden className="absolute inset-0">
          <Image
            src={BANNER}
            alt=""
            fill
            className="object-cover object-[center_20%]"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-black/25" />
        </div>
        <div className="relative z-[1] max-w-[301px] rounded-2xl bg-[rgba(78,143,166,0.75)] px-5 py-2.5 text-center shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] backdrop-blur-[8px]">
          <p className="text-[25px] font-bold leading-snug text-white">
            Створи сад мрії
            <br />
            разом з{" "}
            <span className={`${playfair.className} italic`}>Malva Garden</span>
          </p>
        </div>
        {hubSections.length > 0 ? (
          <div className="relative z-[1] flex max-w-[301px] flex-wrap items-center justify-center gap-x-2.5 gap-y-[30px] px-2.5">
            {hubSections.map((section) => (
              <Link
                key={section.href}
                href={section.href}
                className="flex items-center gap-2.5 rounded-2xl bg-[rgba(77,143,165,0.75)] px-2.5 py-2.5 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] backdrop-blur-[8px]"
              >
                <span className="relative size-[21px] shrink-0 overflow-hidden rounded-2xl">
                  <Image
                    src={section.imageSrc}
                    alt=""
                    fill
                    className={`object-cover ${section.imageClassName}`}
                    sizes="21px"
                    unoptimized={
                      section.imageSrc.startsWith("http") ||
                      section.imageSrc.startsWith("data:")
                    }
                  />
                </span>
                <span className="text-[12px] font-bold leading-none text-white">
                  {section.title}
                </span>
              </Link>
            ))}
          </div>
        ) : null}
      </section>

      <main className="bg-white px-[15px] py-2.5">
        <div className="flex flex-col items-center gap-[15px] py-[15px]">
          <h2 className="text-[24px] font-bold leading-none text-black">
            Лідери продажу:
          </h2>
          <div className="flex w-full flex-wrap justify-center gap-x-2 gap-y-5 rounded-2xl bg-[rgba(231,241,243,0.46)] px-2 py-[15px]">
            {cards.length === 0 && (
              <p className="w-full py-8 text-center text-[16px] text-[#5C5C5C]">
                Товари зʼявляться після підключення каталогу.
              </p>
            )}
            {cards.map((c) => (
              <FigmaProductCardMobile
                key={c.slug}
                productId={c.productId}
                slug={c.slug}
                title={c.title}
                subtitle={c.subtitle}
                price={c.price}
                stockQuantity={c.stockQuantity}
                imageUrl={c.imageUrl}
                titleAs="h3"
              />
            ))}
          </div>
          <Link
            href="/catalog"
            className="flex h-10 w-[225px] items-center justify-center rounded-lg bg-[rgba(231,241,243,0.47)] text-[20px] text-black shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]"
          >
            Показати більше
          </Link>
        </div>
      </main>

      <FigmaStoreFooter variant="mobile" />
    </div>
  );
}
