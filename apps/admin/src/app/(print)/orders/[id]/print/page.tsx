"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api";
import type { OrderDetail } from "@/lib/types";
import { OrderPrintDocument } from "@/components/orders/OrderPrintDocument";
import { Button } from "@/components/ui/Button";

export default function OrderPrintPage() {
  const { id } = useParams<{ id: string }>();
  const autoPrinted = useRef(false);

  const { data: order, isLoading, error } = useQuery({
    queryKey: ["order", id],
    queryFn: () => adminFetch<OrderDetail>(`/admin/orders/${id}`),
  });

  useEffect(() => {
    if (!order || autoPrinted.current) return;
    autoPrinted.current = true;
    const timer = window.setTimeout(() => window.print(), 350);
    return () => window.clearTimeout(timer);
  }, [order]);

  if (isLoading) {
    return (
      <p className="p-8 text-sm text-admin-muted">Завантаження для друку…</p>
    );
  }

  if (error || !order) {
    return (
      <div className="p-8">
        <p className="text-sm text-red-600">
          {(error as Error)?.message ?? "Замовлення не знайдено"}
        </p>
        <Link
          href={`/orders/${id}`}
          className="mt-4 inline-block text-sm text-admin-primary hover:underline"
        >
          ← До замовлення
        </Link>
      </div>
    );
  }

  return (
    <div className="order-print-page">
      <div className="order-print-toolbar no-print">
        <Button type="button" variant="primary" onClick={() => window.print()}>
          Друк
        </Button>
        <Link href={`/orders/${id}`}>
          <Button type="button" variant="secondary">
            Закрити
          </Button>
        </Link>
      </div>
      <OrderPrintDocument order={order} />
    </div>
  );
}
