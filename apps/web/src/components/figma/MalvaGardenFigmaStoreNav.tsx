import Link from "next/link";
import type { ReactNode } from "react";
import { NavSubmenuPanel } from "@/components/figma/NavSubmenuPanel";
import type { FigmaStoreNavSection } from "@/lib/figmaStoreNavSection";

export type { FigmaStoreNavSection } from "@/lib/figmaStoreNavSection";

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

type SubmenuItem = { href: string; label: string };

const KVITY_HUB = { href: "/catalog/kvity", label: "Усі квіти" };
const SHRUB_HUB = {
  href: "/catalog/dekoratyvni-kushi",
  label: "Усі декоративні кущі",
};

const KVITY_SUBMENU: SubmenuItem[] = [
  { href: "/catalog/kvity/odnorichni", label: "Однорічні" },
  { href: "/catalog/kvity/bagatorichni", label: "Багаторічні" },
  { href: "/catalog/kvity/hrizantemy", label: "Хризантеми" },
];

const SHRUB_SUBMENU: SubmenuItem[] = [
  { href: "/catalog/dekoratyvni-kushi/hortenzii", label: "Гортензії" },
  { href: "/catalog/dekoratyvni-kushi/barbaris", label: "Барбарис" },
  { href: "/catalog/dekoratyvni-kushi/trojanda", label: "Троянда" },
  { href: "/catalog/dekoratyvni-kushi/klimatis", label: "Кліматіс" },
];

function NavLabelWithChevron({ children }: { children: ReactNode }) {
  return (
    <>
      <span>{children}</span>
      <NavChevron />
    </>
  );
}

type MalvaGardenFigmaStoreNavProps = {
  activeSection?: FigmaStoreNavSection;
};

export function MalvaGardenFigmaStoreNav({ activeSection }: MalvaGardenFigmaStoreNavProps) {
  return (
    <nav className="relative z-[2] flex h-[44px] min-h-[44px] w-full shrink-0 flex-nowrap items-stretch justify-center gap-0 overflow-visible bg-transparent py-0">
      <div className="pointer-events-none absolute inset-0 z-0 bg-[#548a9d]/35" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-black/[0.04] to-black/[0.12]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-[1280px] items-stretch justify-center gap-0 px-4 sm:px-8 lg:px-12 xl:px-16">
        <div
          className="group/shrub relative z-30 flex h-full min-w-[130px] flex-1 flex-col items-stretch sm:flex-initial"
          aria-haspopup="menu"
        >
          {activeSection === "shrubs" ? (
            <span className={navItemActiveClass}>
              <NavLabelWithChevron>Декоративні кущі</NavLabelWithChevron>
            </span>
          ) : (
            <Link href="/catalog/dekoratyvni-kushi" className={navItemClass}>
              <NavLabelWithChevron>Декоративні кущі</NavLabelWithChevron>
            </Link>
          )}
          <div
            className="pointer-events-none invisible absolute left-1/2 top-full z-50 w-[min(100vw-2rem,260px)] -translate-x-1/2 pt-1 opacity-0 transition-opacity duration-150 group-hover/shrub:pointer-events-auto group-hover/shrub:visible group-hover/shrub:opacity-100"
            role="menu"
            aria-label="Підкатегорії декоративних кущів"
          >
            <NavSubmenuPanel items={SHRUB_SUBMENU} hubLink={SHRUB_HUB} />
          </div>
        </div>

        <div
          className="group/kv relative z-30 flex h-full min-w-[130px] flex-1 flex-col items-stretch sm:flex-initial"
          aria-haspopup="menu"
        >
          {activeSection === "flowers" ? (
            <span className={navItemActiveClass}>
              <NavLabelWithChevron>Квіти</NavLabelWithChevron>
            </span>
          ) : (
            <Link href="/catalog/kvity" className={navItemClass}>
              <NavLabelWithChevron>Квіти</NavLabelWithChevron>
            </Link>
          )}
          <div
            className="pointer-events-none invisible absolute left-1/2 top-full z-50 w-[min(100vw-2rem,260px)] -translate-x-1/2 pt-1 opacity-0 transition-opacity duration-150 group-hover/kv:pointer-events-auto group-hover/kv:visible group-hover/kv:opacity-100"
            role="menu"
            aria-label="Підкатегорії квітів"
          >
            <NavSubmenuPanel items={KVITY_SUBMENU} hubLink={KVITY_HUB} />
          </div>
        </div>

        {activeSection === "herbs" ? (
          <span className={navItemActiveClass}>Декоративні трави</span>
        ) : (
          <Link href="/catalog/dekoratyvni-travy" className={navItemClass}>
            Декоративні трави
          </Link>
        )}
      </div>
    </nav>
  );
}
