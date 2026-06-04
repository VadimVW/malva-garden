"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { FooterContentPageLink } from "@/lib/footerContentPages";

const FooterContentPagesContext = createContext<FooterContentPageLink[]>([]);

export function FooterContentPagesProvider({
  value,
  children,
}: {
  value: FooterContentPageLink[];
  children: ReactNode;
}) {
  return (
    <FooterContentPagesContext.Provider value={value}>
      {children}
    </FooterContentPagesContext.Provider>
  );
}

export function useFooterContentPages(): FooterContentPageLink[] {
  return useContext(FooterContentPagesContext);
}
