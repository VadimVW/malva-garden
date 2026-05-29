"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useFloatingListPosition } from "@/components/ui/useFloatingListPosition";
import {
  buildCatalogUrlQuery,
  getCatalogPageHref,
  parseCatalogQuery,
} from "@/lib/catalogPagination";
import {
  CATALOG_SORT_OPTIONS,
  catalogSortLabel,
  parseCatalogSort,
  type CatalogSort,
} from "@/lib/catalogSort";

function NavChevron({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden
    >
      <path
        d="M3 4.5L6 7.5L9 4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CatalogSortSelectInner({ basePath }: { basePath: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);

  const sort = parseCatalogSort(searchParams.get("sort"));
  const q = parseCatalogQuery(searchParams.get("q") ?? undefined);

  const position = useFloatingListPosition(triggerRef, listRef, open, () =>
    setOpen(false),
  );

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const target = e.target as Node;
      if (rootRef.current?.contains(target)) return;
      if (listRef.current?.contains(target)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function selectSort(next: CatalogSort) {
    setOpen(false);
    const href = getCatalogPageHref(
      basePath,
      1,
      buildCatalogUrlQuery({ q, sort: next }),
    );
    router.push(href);
  }

  const portalList =
    open &&
    position &&
    typeof document !== "undefined"
      ? createPortal(
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            aria-label="Сортування"
            className="min-w-[220px] overflow-hidden rounded-xl border border-[#c5d8dc] bg-white py-1 shadow-[0px_8px_24px_rgba(0,0,0,0.12)]"
            style={{
              position: "fixed",
              top: position.top,
              left: position.left,
              width: Math.max(position.width, 220),
              zIndex: 9999,
            }}
          >
            {CATALOG_SORT_OPTIONS.map((opt) => (
              <li key={opt.value} role="option" aria-selected={sort === opt.value}>
                <button
                  type="button"
                  className={`w-full px-4 py-2.5 text-left text-[13px] font-semibold transition-colors hover:bg-[#E7F1F3] ${
                    sort === opt.value
                      ? "bg-[#E7F1F3] text-[#5C97A8]"
                      : "text-[#333]"
                  }`}
                  onClick={() => selectSort(opt.value)}
                >
                  {opt.label}
                </button>
              </li>
            ))}
          </ul>,
          document.body,
        )
      : null;

  return (
    <div ref={rootRef} className="relative flex flex-wrap items-center gap-2 sm:justify-end">
      <span className="text-[14px] font-semibold text-black">Сортування:</span>
      <button
        ref={triggerRef}
        type="button"
        className="inline-flex items-center gap-2 rounded-full bg-[#5C97A8] px-4 py-2 text-[12px] font-bold text-[#F7F4EF] shadow-[0px_2px_8px_rgba(92,151,168,0.35)] transition-colors hover:bg-[#4d8496]"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={() => setOpen((v) => !v)}
      >
        {catalogSortLabel(sort)}
        <NavChevron className="size-3 shrink-0" />
      </button>
      {portalList}
    </div>
  );
}

export function CatalogSortSelect({ basePath }: { basePath: string }) {
  return (
    <Suspense
      fallback={
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <span className="text-[14px] font-semibold text-black">Сортування:</span>
          <span className="inline-flex rounded-full bg-[#5C97A8]/80 px-4 py-2 text-[12px] font-bold text-[#F7F4EF]">
            …
          </span>
        </div>
      }
    >
      <CatalogSortSelectInner basePath={basePath} />
    </Suspense>
  );
}
