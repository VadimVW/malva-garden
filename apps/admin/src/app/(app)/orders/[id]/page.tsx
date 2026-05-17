"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminFetch, ApiError } from "@/lib/api";
import type { OrderDetail, OrderStatus, PaymentStatus } from "@/lib/types";
import {
  formatDate,
  formatPrice,
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
} from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/providers/ToastProvider";

const orderStatusOptions = Object.entries(ORDER_STATUS_LABELS).map(
  ([value, label]) => ({ value, label }),
);
const paymentStatusOptions = Object.entries(PAYMENT_STATUS_LABELS).map(
  ([value, label]) => ({ value, label }),
);

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();
  const qc = useQueryClient();

  const { data: order, isLoading, error } = useQuery({
    queryKey: ["order", id],
    queryFn: () => adminFetch<OrderDetail>(`/admin/orders/${id}`),
  });

  const patchStatus = useMutation({
    mutationFn: (orderStatus: OrderStatus) =>
      adminFetch(`/admin/orders/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ orderStatus }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["order", id] });
      qc.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Статус оновлено");
    },
    onError: (e) =>
      toast.error(e instanceof ApiError ? e.message : "Помилка"),
  });

  const patchPayment = useMutation({
    mutationFn: (paymentStatus: PaymentStatus) =>
      adminFetch(`/admin/orders/${id}/payment-status`, {
        method: "PATCH",
        body: JSON.stringify({ paymentStatus }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["order", id] });
      qc.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Статус оплати оновлено");
    },
    onError: (e) =>
      toast.error(e instanceof ApiError ? e.message : "Помилка"),
  });

  const patchComment = useMutation({
    mutationFn: (managerComment: string) =>
      adminFetch(`/admin/orders/${id}/manager-comment`, {
        method: "PATCH",
        body: JSON.stringify({ managerComment }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["order", id] });
      toast.success("Коментар збережено");
    },
    onError: (e) =>
      toast.error(e instanceof ApiError ? e.message : "Помилка"),
  });

  if (isLoading) {
    return <p className="text-sm text-admin-muted">Завантаження…</p>;
  }

  if (error || !order) {
    return (
      <p className="text-sm text-red-600">
        {(error as Error)?.message ?? "Замовлення не знайдено"}
      </p>
    );
  }

  return (
    <>
      <PageHeader
        title={`Замовлення ${order.orderNumber}`}
        backHref="/orders"
        action={
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              void navigator.clipboard.writeText(order.orderNumber);
              toast.success("Номер скопійовано");
            }}
          >
            Копіювати номер
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4 p-6">
          <h2 className="text-sm font-semibold">Клієнт</h2>
          <dl className="space-y-2 text-sm">
            <Row label="Ім'я" value={order.customerName} />
            <Row label="Телефон" value={order.customerPhone} />
            {order.customerEmail && (
              <Row label="Email" value={order.customerEmail} />
            )}
          </dl>
          {order.comment && (
            <p className="rounded-lg bg-gray-50 p-3 text-sm">{order.comment}</p>
          )}
        </Card>

        <Card className="space-y-4 p-6">
          <h2 className="text-sm font-semibold">Доставка та оплата</h2>
          <dl className="space-y-2 text-sm">
            {order.deliveryMethod && (
              <Row label="Доставка" value={order.deliveryMethod} />
            )}
            {order.deliveryCity && <Row label="Місто" value={order.deliveryCity} />}
            {order.deliveryAddress && (
              <Row label="Адреса" value={order.deliveryAddress} />
            )}
            {order.paymentMethod && (
              <Row
                label="Оплата"
                value={
                  PAYMENT_METHOD_LABELS[order.paymentMethod] ??
                  order.paymentMethod
                }
              />
            )}
          </dl>
          <p className="text-lg font-semibold">{formatPrice(order.totalAmount)}</p>
          <p className="text-xs text-admin-muted">{formatDate(order.createdAt)}</p>
        </Card>
      </div>

      <Card className="mt-6 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-admin-border bg-gray-50 text-xs uppercase text-admin-muted">
            <tr>
              <th className="px-4 py-3">Товар</th>
              <th className="px-4 py-3">Ціна</th>
              <th className="px-4 py-3">К-сть</th>
              <th className="px-4 py-3">Сума</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b border-admin-border">
                <td className="px-4 py-3">{item.productNameSnapshot}</td>
                <td className="px-4 py-3">{formatPrice(item.priceSnapshot)}</td>
                <td className="px-4 py-3">{item.quantity}</td>
                <td className="px-4 py-3">{formatPrice(item.lineTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card className="mt-6 space-y-4 p-6">
        <h2 className="text-sm font-semibold">Керування</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Статус замовлення"
            options={orderStatusOptions}
            value={order.orderStatus}
            onChange={(e) =>
              patchStatus.mutate(e.target.value as OrderStatus)
            }
          />
          <Select
            label="Статус оплати"
            options={paymentStatusOptions}
            value={order.paymentStatus}
            onChange={(e) =>
              patchPayment.mutate(e.target.value as PaymentStatus)
            }
          />
        </div>
        <ManagerCommentForm
          defaultValue={order.managerComment ?? ""}
          onSave={(v) => patchComment.mutate(v)}
          loading={patchComment.isPending}
        />
        <div className="flex gap-2">
          <Badge tone="blue">{ORDER_STATUS_LABELS[order.orderStatus]}</Badge>
          <Badge tone="green">
            {PAYMENT_STATUS_LABELS[order.paymentStatus]}
          </Badge>
        </div>
      </Card>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-admin-muted">{label}</dt>
      <dd className="text-right">{value}</dd>
    </div>
  );
}

function ManagerCommentForm({
  defaultValue,
  onSave,
  loading,
}: {
  defaultValue: string;
  onSave: (value: string) => void;
  loading?: boolean;
}) {
  const [value, setValue] = useState(defaultValue);
  return (
    <div>
      <Textarea
        label="Коментар менеджера"
        rows={3}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <Button
        type="button"
        className="mt-2"
        disabled={loading}
        onClick={() => onSave(value)}
      >
        {loading ? "Збереження…" : "Зберегти коментар"}
      </Button>
    </div>
  );
}
