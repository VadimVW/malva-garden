"use client";

import type { ReactNode } from "react";

type Props = {
  page: number;
  className?: string;
  children: ReactNode;
};

/** Обгортка сітки каталогу — fade при зміні сторінки пагінації */
export function CatalogGridFade({ page, className = "", children }: Props) {
  return (
    <div key={page} className={`mg-catalog-grid-fade ${className}`.trim()}>
      {children}
    </div>
  );
}
