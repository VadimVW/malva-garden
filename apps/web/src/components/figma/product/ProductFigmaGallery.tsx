"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

export type GalleryImage = {
  imageUrl: string;
  altText: string | null;
  isMain: boolean;
};

type Props = {
  images: GalleryImage[];
  /** Якщо з API немає зображень — фолбек з макету Figma */
  fallbackSrc: string;
  productName: string;
};

export function ProductFigmaGallery({
  images,
  fallbackSrc,
  productName,
}: Props) {
  const ordered = useMemo(() => {
    if (!images.length) return [];
    const sorted = [...images].sort((a, b) =>
      a.isMain === b.isMain ? 0 : a.isMain ? -1 : 1,
    );
    return sorted;
  }, [images]);

  const [active, setActive] = useState(0);

  const main = ordered[active] ?? null;
  const thumbs = ordered.slice(0, 3);
  const mainSrc = main?.imageUrl ?? fallbackSrc;
  const mainAlt = main?.altText ?? productName;

  return (
    <div className="w-full shrink-0 lg:max-w-[440px] lg:flex-1">
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-white shadow-[0px_6px_20px_rgba(0,0,0,0.08)]">
        <Image
          src={mainSrc}
          alt={mainAlt}
          fill
          className="object-contain object-center"
          sizes="(max-width: 1024px) 100vw, 440px"
          priority
          unoptimized={mainSrc.startsWith("http")}
        />
      </div>
      <div className="mt-4 flex gap-3">
        {(thumbs.length ? thumbs : [null, null, null]).map((img, i) => {
          const src = img?.imageUrl ?? fallbackSrc;
          const alt = img?.altText ?? `${productName} — фото ${i + 1}`;
          return (
            <button
              key={img?.imageUrl ? `${img.imageUrl}-${i}` : `thumb-${i}`}
              type="button"
              onClick={() => {
                if (ordered.length) setActive(i);
              }}
              className={`relative size-[72px] shrink-0 overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-black/5 ${
                ordered.length && active === i ? "ring-2 ring-[#5C97A8]" : ""
              }`}
              aria-label={`Мініатюра ${i + 1}`}
              aria-current={ordered.length && active === i ? "true" : undefined}
            >
              <Image
                src={src}
                alt={alt}
                fill
                className="object-cover object-center"
                sizes="72px"
                unoptimized={src.startsWith("http")}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
