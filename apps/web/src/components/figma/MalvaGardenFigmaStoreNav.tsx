import Link from "next/link";
import type { ReactNode } from "react";
import type { FigmaStoreNavSection } from "@/lib/figmaStoreNavSection";

export type { FigmaStoreNavSection } from "@/lib/figmaStoreNavSection";

const navItemClass =
  "relative z-10 flex h-full min-w-[130px] flex-1 items-center justify-center px-3 text-center text-[12px] font-bold leading-tight text-[#F7F4EF] transition-colors hover:bg-[#4C8094]/30 sm:flex-initial";

const navItemActiveClass =
  "relative z-10 flex h-full min-w-[130px] flex-1 items-center justify-center bg-[#4C8094]/45 px-3 text-center text-[12px] font-bold leading-tight text-[#F7F4EF] sm:flex-initial";

const KVITY_SUBMENU = [
  {
    href: "/catalog/kvity/odnorichni",
    label: "Однорічні",
    icon: (
      <svg className="size-4 shrink-0 text-[#5C97A8]" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 22V12M12 12c-2-3-6-3-6-8a6 6 0 0112 0c0 5-4 5-6 8z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/catalog/kvity/bagatorichni",
    label: "Багаторічні",
    icon: (
      <svg className="size-4 shrink-0 text-[#5C97A8]" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 8a3 3 0 100-6 3 3 0 000 6zm0 0c-4 2-6 5-6 10h12c0-5-2-8-6-10z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/catalog/kvity/hrizantemy",
    label: "Хризантеми",
    icon: (
      <svg className="size-4 shrink-0 text-[#5C97A8]" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M12 12.5v3M8 10l-2-1M16 10l2-1M9.5 7.5L8 5.5M14.5 7.5L16 5.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
] as const;

const SHRUB_SUBMENU = [
  {
    href: "/catalog/dekoratyvni-kushi/hortenzii",
    label: "Гортензії",
    icon: (
      <svg className="size-4 shrink-0 text-[#5C97A8]" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 3v4M12 17v4M5 12H1M23 12h-4M6.34 6.34L3.51 3.51M20.49 20.49l-2.83-2.83M6.34 17.66l-2.83 2.83M20.49 3.51l-2.83 2.83"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    href: "/catalog/dekoratyvni-kushi/barbaris",
    label: "Барбарис",
    icon: (
      <svg className="size-4 shrink-0 text-[#5C97A8]" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 22c-4-6-8-8-8-14a8 8 0 0116 0c0 6-4 8-8 14z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/catalog/dekoratyvni-kushi/trojanda",
    label: "Троянда",
    icon: (
      <svg className="size-4 shrink-0 text-[#5C97A8]" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 8c-2 0-4 2-4 4 0 3 4 6 4 6s4-3 4-6c0-2-2-4-4-4z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M12 18v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/catalog/dekoratyvni-kushi/klimatis",
    label: "Кліматіс",
    icon: (
      <svg className="size-4 shrink-0 text-[#5C97A8]" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 2v6M12 16v6M4.93 4.93l4.24 4.24M14.83 14.83l4.24 4.24M2 12h6M16 12h6M4.93 19.07l4.24-4.24M14.83 9.17l4.24-4.24"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
] as const;

function submenuPanel(items: readonly { href: string; label: string; icon: ReactNode }[]) {
  return (
    <ul className="rounded-b-xl rounded-tr-xl bg-white py-2 shadow-[0px_10px_30px_rgba(0,0,0,0.12)] ring-1 ring-black/5">
      {items.map((item) => (
        <li key={item.href} role="none">
          <Link
            href={item.href}
            role="menuitem"
            className="flex items-center gap-3 px-4 py-2.5 text-left text-[13px] font-semibold text-[#5C97A8] transition-colors hover:bg-[#E7F1F3]"
          >
            {item.icon}
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
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
      <div className="group/shrub relative z-30 flex h-full min-w-[130px] flex-1 flex-col items-stretch sm:flex-initial">
        {activeSection === "shrubs" ? (
          <span className={navItemActiveClass}>Декоративні кущі</span>
        ) : (
          <Link href="/catalog/dekoratyvni-kushi" className={navItemClass}>
            Декоративні кущі
          </Link>
        )}
        <div
          className="pointer-events-none invisible absolute left-1/2 top-full z-50 w-[min(100vw-2rem,260px)] -translate-x-1/2 pt-1 opacity-0 transition-opacity duration-150 group-hover/shrub:pointer-events-auto group-hover/shrub:visible group-hover/shrub:opacity-100"
          role="menu"
          aria-label="Підкатегорії декоративних кущів"
        >
          {submenuPanel(SHRUB_SUBMENU)}
        </div>
      </div>

      <div className="group/kv relative z-30 flex h-full min-w-[130px] flex-1 flex-col items-stretch sm:flex-initial">
        {activeSection === "flowers" ? (
          <span className={navItemActiveClass}>Квіти</span>
        ) : (
          <Link href="/catalog/kvity" className={navItemClass}>
            Квіти
          </Link>
        )}
        <div
          className="pointer-events-none invisible absolute left-1/2 top-full z-50 w-[min(100vw-2rem,260px)] -translate-x-1/2 pt-1 opacity-0 transition-opacity duration-150 group-hover/kv:pointer-events-auto group-hover/kv:visible group-hover/kv:opacity-100"
          role="menu"
          aria-label="Підкатегорії квітів"
        >
          {submenuPanel(KVITY_SUBMENU)}
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
