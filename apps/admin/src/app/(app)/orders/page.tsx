"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api";
import type { OrdersPage } from "@/lib/types";
import {
  formatDate,
  formatPrice,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
} from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

function statusTone(status: string): "blue" | "yellow" | "green" | "red" | "gray" {
  if (status === "NEW") return "blue";
  if (status === "PROCESSING") return "yellow";
  if (status === "COMPLETED" || status === "SHIPPED") return "green";
  if (status === "CANCELLED") return "red";
  return "gray";
}

export default function OrdersPage() {
  const params = useSearchParams();
  const page = Math.max(1, Number(params.get("page") ?? "1") || 1);

  const { data, isLoading, error } = useQuery({
    queryKey: ["orders", page],
    queryFn: () =>
      adminFetch<OrdersPage>(`/admin/orders?page=${page}&limit=20`),
  });

  return (
    <>
      <PageHeader
        title="Замовлення"
        description="Список замовлень з вітрини"
      />
      <Card className="overflow-hidden">
        {isLoading && (
          <p className="p-6 text-sm text-admin-muted">Завантаження…</p>
        )}
        {error && (
          <p className="p-6 text-sm text-red-600">{(error as Error).message}</p>
        )}
        {data && data.items.length === 0 && (
          <p className="p-6 text-sm text-admin-muted">Замовлень ще немає.</p>
        )}
        {data && data.items.length > 0 && (
          <>
            <table className="w-full text-left text-sm">
              <thead className="border-b border-admin-border bg-gray-50 text-xs uppercase text-admin-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Номер</th>
                  <th className="px-4 py-3 font-medium">Клієнт</th>
                  <th className="px-4 py-3 font-medium">Сума</th>
                  <th className="px-4 py-3 font-medium">Статус</th>
                  <th className="px-4 py-3 font-medium">Оплата</th>
                  <th className="px-4 py-3 font-medium">Дата</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {data.items.map((o) => (
                  <tr
                    key={o.id}
                    className="border-b border-admin-border last:border-0"
                  >
                    <td className="px-4 py-3 font-mono text-xs">{o.orderNumber}</td>
                    <td className="px-4 py-3">
                      <p>{o.customerName}</p>
                      <p className="text-xs text-admin-muted">{o.customerPhone}</p>
                    </td>
                    <td className="px-4 py-3">{formatPrice(o.totalAmount)}</td>
                    <td className="px-4 py-3">
                      <Badge tone={statusTone(o.orderStatus)}>
                        {ORDER_STATUS_LABELS[o.orderStatus]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        tone={
                          o.paymentStatus === "PAID"
                            ? "green"
                            : o.paymentStatus === "FAILED"
                              ? "red"
                              : "yellow"
                        }
                      >
                        {PAYMENT_STATUS_LABELS[o.paymentStatus]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-admin-muted">
                      {formatDate(o.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/orders/${o.id}`}
                        className="text-admin-primary hover:underline"
                      >
                        Деталі
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-admin-border px-4 py-3">
                <p className="text-xs text-admin-muted">
                  Сторінка {data.page} з {data.totalPages} ({data.total} замовлень)
                </p>
                <div className="flex gap-2">
                  {page > 1 && (
                    <Link href={`/orders?page=${page - 1}`}>
                      <Button variant="secondary">Назад</Button>
                    </Link>
                  )}
                  {page < data.totalPages && (
                    <Link href={`/orders?page=${page + 1}`}>
                      <Button variant="secondary">Далі</Button>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </>
  );
}
