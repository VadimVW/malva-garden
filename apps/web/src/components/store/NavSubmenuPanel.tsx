"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type SubmenuItem = { href: string; label: string };
type HubLink = { href: string; label: string };

function NavSubmenuSpinner() {
  return (
    <span
      className="inline-block size-3.5 shrink-0 animate-spin rounded-full border-2 border-[#5C97A8] border-t-transparent"
      aria-hidden
    />
  );
}

function NavSubmenuLink({
  href,
  label,
  variant,
  navigatingHref,
  onNavigate,
}: {
  href: string;
  label: string;
  variant: "hub" | "item";
  navigatingHref: string | null;
  onNavigate: (href: string) => void;
}) {
  const isLoading = navigatingHref === href;
  const isBlocked = navigatingHref !== null && !isLoading;

  const className =
    variant === "hub"
      ? `flex items-center gap-2.5 border-b border-[#E7F1F3] px-4 py-2.5 text-left text-[13px] font-bold text-[#5C97A8] transition-colors hover:bg-[#E7F1F3] active:bg-[#dce8eb] ${
          isLoading ? "cursor-wait bg-[#E7F1F3]" : ""
        } ${isBlocked ? "pointer-events-none opacity-50" : ""}`
      : `flex items-center gap-2.5 px-4 py-2.5 text-left text-[13px] font-semibold text-[#5C97A8] transition-colors hover:bg-[#E7F1F3] active:bg-[#dce8eb] ${
          isLoading ? "cursor-wait bg-[#E7F1F3]" : ""
        } ${isBlocked ? "pointer-events-none opacity-50" : ""}`;

  return (
    <Link
      href={href}
      role="menuitem"
      prefetch
      className={className}
      aria-busy={isLoading}
      onClick={(e) => {
        if (navigatingHref) {
          e.preventDefault();
          return;
        }
        onNavigate(href);
      }}
    >
      {isLoading ? <NavSubmenuSpinner /> : null}
      <span className="min-w-0 flex-1">{label}</span>
    </Link>
  );
}

type NavSubmenuPanelProps = {
  items: readonly SubmenuItem[];
  hubLink: HubLink;
};

export function NavSubmenuPanel({ items, hubLink }: NavSubmenuPanelProps) {
  const pathname = usePathname();
  const [navigatingHref, setNavigatingHref] = useState<string | null>(null);

  useEffect(() => {
    setNavigatingHref(null);
  }, [pathname]);

  return (
    <ul
      className={`rounded-b-xl rounded-tr-xl bg-white py-2 shadow-[0px_10px_30px_rgba(0,0,0,0.12)] ring-1 ring-black/5 ${
        navigatingHref ? "cursor-wait" : ""
      }`}
      aria-busy={navigatingHref !== null}
    >
      <li role="none">
        <NavSubmenuLink
          href={hubLink.href}
          label={hubLink.label}
          variant="hub"
          navigatingHref={navigatingHref}
          onNavigate={setNavigatingHref}
        />
      </li>
      {items.map((item) => (
        <li key={item.href} role="none">
          <NavSubmenuLink
            href={item.href}
            label={item.label}
            variant="item"
            navigatingHref={navigatingHref}
            onNavigate={setNavigatingHref}
          />
        </li>
      ))}
    </ul>
  );
}
