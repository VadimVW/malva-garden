import Image from "next/image";
import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Montserrat_Alternates } from "next/font/google";
import { FigmaStoreFooter } from "@/components/store/FigmaStoreFooter";
import { FigmaStoreHeader } from "@/components/store/FigmaStoreHeader";
import type { FigmaBreadcrumbItem } from "@/components/store/figmaPageTypes";

const montserratAlternates = Montserrat_Alternates({
  weight: ["400", "600", "700"],
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  display: "swap",
});

const CATALOG_HOME_BTN = "/images/figma/catalog/home-btn.svg";

export const figmaInputClass =
  "w-full rounded-xl border border-[#c5d8dc] bg-white px-4 py-3 text-[14px] text-black outline-none transition-shadow placeholder:text-[#9C9A9A] focus:border-[#5C97A8] focus:ring-2 focus:ring-[#5C97A8]/25";

export function FigmaPrimaryButton({
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`mg-btn-primary inline-flex items-center justify-center rounded-xl bg-[#2f6f4e] px-6 py-3.5 text-[15px] font-bold text-white ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function FigmaSecondaryLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`mg-btn-secondary inline-flex items-center justify-center rounded-xl border-2 border-[#5C97A8] bg-white px-6 py-3 text-[15px] font-semibold text-[#5C97A8] hover:bg-[#E7F1F3] ${className}`}
    >
      {children}
    </Link>
  );
}

function FigmaBreadcrumbs({ items }: { items: FigmaBreadcrumbItem[] }) {
  return (
    <nav
      className="mb-8 flex flex-wrap items-center gap-2 text-[12px] leading-none"
      aria-label="Навігаційні крихти"
    >
      <Link
        href="/"
        className="inline-flex items-center text-[#5E8F98] hover:underline"
        aria-label="Головна"
      >
        <Image
          src={CATALOG_HOME_BTN}
          alt=""
          width={13}
          height={14}
          unoptimized
          className="shrink-0"
        />
      </Link>
      {items.map((c, i) => {
        const last = i === items.length - 1;
        return (
          <span key={`${c.label}-${i}`} className="inline-flex items-center gap-2">
            <span className="text-[#9C9A9A]" aria-hidden>
              /
            </span>
            {last || !c.href ? (
              <span className={last ? "font-semibold text-black" : "text-[#5E8F98]"}>
                {c.label}
              </span>
            ) : (
              <Link href={c.href} className="text-[#5E8F98] hover:underline">
                {c.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

type MalvaGardenFigmaPageShellProps = {
  breadcrumbs: FigmaBreadcrumbItem[];
  title: string;
  subtitle?: string;
  activeRootSlug?: string;
  children: ReactNode;
};

export function MalvaGardenFigmaPageShell({
  breadcrumbs,
  title,
  subtitle,
  activeRootSlug,
  children,
}: MalvaGardenFigmaPageShellProps) {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-visible bg-[#F5F5F5]">
      <FigmaStoreHeader activeRootSlug={activeRootSlug} />


      <div
        className={`flex min-w-0 flex-1 flex-col bg-[#F5F5F5] ${montserratAlternates.className}`}
      >
        <div className="flex w-full min-w-0 justify-center px-[15px] pb-12 pt-4 sm:px-8 lg:px-12 lg:pt-6">
          <div className="mg-figma-content-panel min-w-0 px-0 pb-8 pt-2 sm:px-8 lg:px-5 lg:pb-12 lg:pt-8">
            <FigmaBreadcrumbs items={breadcrumbs} />
            <header className="mb-8">
              <h1 className="text-[24px] font-bold leading-tight text-black sm:text-[28px] lg:text-[32px]">
                {title}
              </h1>
              {subtitle ? (
                <p className="mt-2 text-[14px] leading-snug text-[#5a5a5a]">{subtitle}</p>
              ) : null}
            </header>
            <div className="min-w-0">{children}</div>
          </div>
        </div>

        <FigmaStoreFooter />
      </div>
    </div>
  );
}
