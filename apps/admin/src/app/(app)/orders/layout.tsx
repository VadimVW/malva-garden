import { Suspense } from "react";

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Suspense fallback={<p className="text-sm text-admin-muted">Завантаження…</p>}>{children}</Suspense>;
}
