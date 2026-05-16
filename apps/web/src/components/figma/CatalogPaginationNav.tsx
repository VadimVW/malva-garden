import Link from "next/link";
import {
  buildPaginationItems,
  getCatalogPageHref,
  type CatalogPaginationMeta,
} from "@/lib/catalogPagination";

export function CatalogPaginationNav({
  basePath,
  pagination,
}: {
  basePath: string;
  pagination: CatalogPaginationMeta;
}) {
  const { page, totalPages } = pagination;
  if (totalPages <= 1) return null;

  const items = buildPaginationItems(page, totalPages);
  const prevHref = page > 1 ? getCatalogPageHref(basePath, page - 1) : null;
  const nextHref =
    page < totalPages ? getCatalogPageHref(basePath, page + 1) : null;

  const btnClass =
    "inline-flex size-9 items-center justify-center rounded-full text-[#5C97A8] transition-all duration-200 hover:bg-white/80 hover:scale-105";
  const activeClass =
    "mg-pagination-active inline-flex size-9 items-center justify-center rounded-full bg-[#5C97A8] text-[#F7F4EF]";

  return (
    <nav
      className="mt-12 flex flex-wrap items-center justify-center gap-1.5 text-[14px] font-semibold"
      aria-label="Сторінки каталогу"
    >
      {prevHref ? (
        <Link href={prevHref} className={btnClass} aria-label="Попередня сторінка">
          ‹
        </Link>
      ) : (
        <span
          className={`${btnClass} pointer-events-none opacity-40`}
          aria-disabled="true"
        >
          ‹
        </span>
      )}

      {items.map((item, i) =>
        item === "ellipsis" ? (
          <span key={`e-${i}`} className="px-1 text-[#9C9A9A]" aria-hidden>
            …
          </span>
        ) : item === page ? (
          <span key={`active-${page}`} className={activeClass} aria-current="page">
            {item}
          </span>
        ) : (
          <Link key={item} href={getCatalogPageHref(basePath, item)} className={btnClass}>
            {item}
          </Link>
        ),
      )}

      {nextHref ? (
        <Link href={nextHref} className={btnClass} aria-label="Наступна сторінка">
          ›
        </Link>
      ) : (
        <span
          className={`${btnClass} pointer-events-none opacity-40`}
          aria-disabled="true"
        >
          ›
        </span>
      )}
    </nav>
  );
}
