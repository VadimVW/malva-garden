"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { SiteShell } from "@/components/SiteShell";

/**
 * Сторінки з повним «хромом» з макету Figma — без глобального SiteShell,
 * щоб не дублювати шапку/футер.
 */
function isFigmaChromePath(pathname: string | null): boolean {
  if (!pathname) return false;
  if (pathname.startsWith("/figma-preview")) return true;
  if (pathname === "/") return true;
  if (pathname.startsWith("/catalog/kvity")) return true;
  if (pathname.startsWith("/catalog/dekoratyvni-kushi")) return true;
  if (pathname.startsWith("/catalog/dekoratyvni-travy")) return true;
  if (pathname === "/catalog") return true;
  if (pathname.startsWith("/product/")) return true;
  if (pathname === "/cart" || pathname === "/checkout") return true;
  if (pathname.startsWith("/pages/")) return true;
  if (pathname.startsWith("/order/")) return true;
  return false;
}

export function ConditionalSiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (isFigmaChromePath(pathname)) {
    return <>{children}</>;
  }
  return <SiteShell>{children}</SiteShell>;
}
