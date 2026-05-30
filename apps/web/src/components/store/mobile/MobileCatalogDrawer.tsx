"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useCatalogNavSections } from "@/providers/CatalogNavProvider";
import { useMobileCatalogDrawer } from "./MobileCatalogDrawerContext";

export function MobileCatalogDrawer() {
  const { open, closeDrawer } = useMobileCatalogDrawer();
  const sections = useCatalogNavSections();
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeDrawer();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeDrawer]);

  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] lg:hidden" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Закрити меню каталогу"
        onClick={closeDrawer}
      />
      <aside
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Каталог"
        className="absolute bottom-0 left-0 top-0 flex w-[min(320px,88vw)] flex-col bg-[#E7F1F3] shadow-xl outline-none"
      >
        <div className="flex items-center justify-between border-b border-[#c5d8dc] px-4 py-3">
          <p className="text-[16px] font-bold text-black">Каталог</p>
          <button
            type="button"
            onClick={closeDrawer}
            className="rounded-lg px-2 py-1 text-[14px] font-semibold text-[#5C97A8] hover:bg-white/60"
          >
            Закрити
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Розділи каталогу">
          <ul className="space-y-4">
            {sections.map((section) => (
              <li key={section.slug}>
                <Link
                  href={section.href}
                  onClick={closeDrawer}
                  className="block rounded-lg px-2 py-1.5 text-[15px] font-bold text-[#5C97A8] hover:bg-white/70"
                >
                  {section.name}
                </Link>
                <ul className="mt-1 space-y-0.5 pl-2">
                  <li>
                    <Link
                      href={section.hubLink.href}
                      onClick={closeDrawer}
                      className="block rounded-lg px-2 py-1.5 text-[13px] font-semibold text-black hover:bg-white/70"
                    >
                      {section.hubLink.label}
                    </Link>
                  </li>
                  {section.children.map((child) => (
                    <li key={child.href}>
                      <Link
                        href={child.href}
                        onClick={closeDrawer}
                        className="block rounded-lg px-2 py-1.5 text-[13px] text-[#333] hover:bg-white/70"
                      >
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
          <Link
            href="/catalog"
            onClick={closeDrawer}
            className="mt-6 block rounded-xl border-2 border-[#5C97A8] bg-white px-4 py-3 text-center text-[14px] font-semibold text-[#5C97A8]"
          >
            Усі розділи
          </Link>
        </nav>
      </aside>
    </div>
  );
}
