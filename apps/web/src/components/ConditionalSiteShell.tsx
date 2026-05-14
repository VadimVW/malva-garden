"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { SiteShell } from "@/components/SiteShell";

/** На /figma-preview* не показуємо SiteShell — щоб не дублювати шапку з макету Figma. */
export function ConditionalSiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/figma-preview")) {
    return <>{children}</>;
  }
  return <SiteShell>{children}</SiteShell>;
}
