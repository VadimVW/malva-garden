"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "./ui/Button";

const nav = [
  { href: "/categories", label: "Категорії" },
  { href: "/products", label: "Товари" },
  { href: "/orders", label: "Замовлення" },
  { href: "/reviews", label: "Відгуки", pendingBadge: true },
  { href: "/pages", label: "Сторінки" },
  { href: "/settings", label: "Налаштування" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  const { data: pendingReviews } = useQuery({
    queryKey: ["reviews-pending-count"],
    queryFn: () =>
      adminFetch<{ total: number }>("/admin/reviews/pending-count"),
    refetchInterval: 60_000,
  });

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-admin-border bg-admin-surface">
      <div className="border-b border-admin-border px-5 py-5">
        <p className="text-xs font-medium uppercase tracking-wide text-admin-muted">
          Malva Garden
        </p>
        <p className="mt-1 text-lg font-semibold text-gray-900">Адмін</p>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {nav.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                active
                  ? "bg-admin-primary text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span>{item.label}</span>
              {"pendingBadge" in item &&
              item.pendingBadge &&
              (pendingReviews?.total ?? 0) > 0 ? (
                <span
                  className={`min-w-[1.25rem] rounded-full px-1.5 py-0.5 text-center text-[11px] font-semibold ${
                    active
                      ? "bg-white/20 text-white"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {pendingReviews!.total}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-admin-border p-3">
        <Button type="button" variant="ghost" className="w-full" onClick={logout}>
          Вихід
        </Button>
      </div>
    </aside>
  );
}
