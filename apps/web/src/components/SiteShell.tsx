import Link from "next/link";
import type { ReactNode } from "react";

const footerLinks = [
  { href: "/pages/dostavka-ta-oplata", label: "Доставка та оплата" },
  { href: "/pages/povernennya", label: "Повернення" },
  { href: "/pages/publichna-oferta", label: "Публічна оферта" },
  { href: "/pages/konfidenciynist", label: "Конфіденційність" },
  { href: "/pages/kontakty", label: "Контакти" },
];

/**
 * Мінімальний каркас навігації без макету Figma — замінимо після узгодження дизайну.
 */
export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-4 px-4 py-3">
          <Link href="/" className="font-semibold text-emerald-900">
            Malva Garden
          </Link>
          <nav className="flex flex-wrap gap-4 text-sm text-slate-700">
            <Link href="/catalog" className="hover:underline">
              Каталог
            </Link>
            <Link href="/cart" className="hover:underline">
              Кошик
            </Link>
            <Link href="/checkout" className="hover:underline">
              Оформлення
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-slate-200 bg-slate-50 text-sm text-slate-600">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-6">
          <span className="font-medium text-slate-800">Malva Garden</span>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {footerLinks.map((l) => (
              <Link key={l.href} href={l.href} className="hover:underline">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
