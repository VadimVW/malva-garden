"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCustomerAuth } from "@/providers/CustomerAuthProvider";

const links = [
  { href: "/account/orders", label: "Мої замовлення" },
  { href: "/account/profile", label: "Профіль і адреси" },
] as const;

export function MalvaGardenAccountNav() {
  const pathname = usePathname();
  const { logout, customer } = useCustomerAuth();

  return (
    <nav
      className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-[#c5d8dc] pb-4"
      aria-label="Особистий кабінет"
    >
      <div className="flex flex-wrap gap-2">
        {links.map((link) => {
          const active = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full px-4 py-2 text-[13px] font-semibold transition-colors ${
                active
                  ? "bg-[#5C97A8] text-[#F7F4EF]"
                  : "bg-white text-[#5C97A8] ring-1 ring-[#c5d8dc] hover:bg-[#E7F1F3]"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center gap-3 text-[13px] text-[#5a5a5a]">
        {customer?.email ? (
          <span className="max-w-[200px] truncate">{customer.email}</span>
        ) : null}
        {!customer?.emailVerified ? (
          <span className="rounded-lg bg-amber-50 px-2 py-1 text-amber-900">
            Підтвердіть email
          </span>
        ) : null}
        <button
          type="button"
          onClick={logout}
          className="font-semibold text-[#5C97A8] hover:underline"
        >
          Вийти
        </button>
      </div>
    </nav>
  );
}
