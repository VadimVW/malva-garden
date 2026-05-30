"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { shouldShowMobileTabBar } from "@/lib/mobileChromeRoutes";
import { MobileCatalogDrawer } from "./MobileCatalogDrawer";
import { MobileCatalogDrawerProvider } from "./MobileCatalogDrawerContext";
import { MobileStoreHeader } from "./MobileStoreHeader";
import { MobileStoreTabBar } from "./MobileStoreTabBar";

function MobileChromeInner() {
  const pathname = usePathname();
  const showTabBar = shouldShowMobileTabBar(pathname);

  return (
    <>
      <MobileStoreHeader />
      {showTabBar ? <MobileStoreTabBar /> : null}
      <MobileCatalogDrawer />
    </>
  );
}

export function MobileStoreChrome() {
  return (
    <div className="lg:hidden">
      <MobileCatalogDrawerProvider>
        <MobileChromeInner />
      </MobileCatalogDrawerProvider>
    </div>
  );
}

export function MobileStoreLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <MobileStoreChrome />
      <div className="min-h-screen bg-[#5C97A8] pt-[var(--mg-mobile-content-pt)] pb-[var(--mg-mobile-content-pb)] lg:bg-transparent lg:pt-0 lg:pb-0">
        {children}
      </div>
    </>
  );
}
