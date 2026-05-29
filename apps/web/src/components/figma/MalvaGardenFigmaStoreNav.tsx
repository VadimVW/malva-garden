"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { NavSubmenuPanel } from "@/components/figma/NavSubmenuPanel";
import { useCatalogNavSections } from "@/providers/CatalogNavProvider";

const navItemClass =
  "relative z-10 inline-flex h-full min-w-[130px] flex-1 items-center justify-center gap-1 px-3 text-center text-[12px] font-bold leading-tight text-[#F7F4EF] transition-colors hover:bg-[#4C8094]/30 sm:flex-initial";

const navItemActiveClass =
  "relative z-10 inline-flex h-full min-w-[130px] flex-1 items-center justify-center gap-1 bg-[#4C8094]/45 px-3 text-center text-[12px] font-bold leading-tight text-[#F7F4EF] sm:flex-initial";

function NavChevron() {
  return (
    <svg
      className="size-3 shrink-0 opacity-90"
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

function NavLabelWithChevron({ children }: { children: ReactNode }) {
  return (
    <>
      <span>{children}</span>
      <NavChevron />
    </>
  );
}

type MalvaGardenFigmaStoreNavProps = {
  activeRootSlug?: string;
};

export function MalvaGardenFigmaStoreNav({
  activeRootSlug,
}: MalvaGardenFigmaStoreNavProps) {
  const sections = useCatalogNavSections();

  return (
    <nav className="relative z-[2] flex h-[44px] min-h-[44px] w-full shrink-0 flex-nowrap items-stretch justify-center gap-0 overflow-visible bg-transparent py-0">
      <div className="pointer-events-none absolute inset-0 z-0 bg-[#548a9d]/35" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-black/[0.04] to-black/[0.12]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-[1280px] items-stretch justify-center gap-0 px-4 sm:px-8 lg:px-12 xl:px-16">
        {sections.map((section) => {
          const hasChildren = section.children.length > 0;
          const isActive = activeRootSlug === section.slug;
          if (hasChildren) {
            return (
              <div
                key={section.slug}
                className="group relative z-30 flex h-full min-w-[130px] flex-1 flex-col items-stretch sm:flex-initial"
                aria-haspopup="menu"
              >
                {isActive ? (
                  <span className={navItemActiveClass}>
                    <NavLabelWithChevron>{section.name}</NavLabelWithChevron>
                  </span>
                ) : (
                  <Link href={section.href} className={navItemClass}>
                    <NavLabelWithChevron>{section.name}</NavLabelWithChevron>
                  </Link>
                )}
                <div
                  className="pointer-events-none invisible absolute left-1/2 top-full z-50 w-[min(100vw-2rem,260px)] -translate-x-1/2 pt-1 opacity-0 transition-opacity duration-150 group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100"
                  role="menu"
                  aria-label={`Підкатегорії: ${section.name}`}
                >
                  <NavSubmenuPanel
                    items={section.children}
                    hubLink={section.hubLink}
                  />
                </div>
              </div>
            );
          }

          return isActive ? (
            <span key={section.slug} className={navItemActiveClass}>
              {section.name}
            </span>
          ) : (
            <Link key={section.slug} href={section.href} className={navItemClass}>
              {section.name}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
