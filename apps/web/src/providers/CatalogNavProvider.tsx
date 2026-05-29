"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { StoreNavSection } from "@/lib/catalogTree";

const CatalogNavContext = createContext<StoreNavSection[]>([]);

export function CatalogNavProvider({
  sections,
  children,
}: {
  sections: StoreNavSection[];
  children: ReactNode;
}) {
  return (
    <CatalogNavContext.Provider value={sections}>
      {children}
    </CatalogNavContext.Provider>
  );
}

export function useCatalogNavSections(): StoreNavSection[] {
  return useContext(CatalogNavContext);
}
