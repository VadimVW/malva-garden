"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api";
import type { ReviewStatus, ReviewsPage } from "@/lib/types";
import { formatDate, REVIEW_STATUS_LABELS } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

function reviewStatusTone(
  status: ReviewStatus,
): "blue" | "yellow" | "green" | "red" | "gray" {
  if (status === "PENDING") return "yellow";
  if (status === "PUBLISHED") return "green";
  if (status === "REJECTED") return "red";
  return "gray";
}

function ReviewsPageContent() {
  const params = useSearchParams();
  const page = Math.max(1, Number(params.get("page") ?? "1") || 1);
  const status = (params.get("status") as ReviewStatus | null) ?? "PENDING";
  const q = params.get("q")?.trim() ?? "";

  const queryString = new URLSearchParams({
    page: String(page),
    limit: "20",
    ...(status ? { status } : {}),
    ...(q ? { q } : {}),
  }).toString();

  const { data, isLoading, error } = useQuery({
    queryKey: ["reviews", page, status, q],
    queryFn: () => adminFetch<ReviewsPage>(`/admin/reviews?${queryString}`),
  });

  const statusFilters: { value: ReviewStatus | ""; label: string }[] = [
    { value: "PENDING", label: "На модерації" },
    { value: "PUBLISHED", label: "Опубліковані" },
    { value: "REJECTED", label: "Відхилені" },
    { value: "", label: "Усі" },
  ];

  return (
    <>
      <PageHeader
        title="Відгуки"
        description="Модерація відгуків клієнтів на сторінках товарів"
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {statusFilters.map((f) => {
          const next = new URLSearchParams();
          if (f.value) next.set("status", f.value);
          if (q) next.set("q", q);
          const href = `/reviews${next.toString() ? `?${next}` : ""}`;
          const active = (status || "") === f.value;
          return (
            <Link
              key={f.label}
              href={href}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                active
                  ? "bg-admin-primary text-white"
                  : "bg-white text-gray-700 ring-1 ring-admin-border hover:bg-gray-50"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      <Card className="overflow-hidden">
        {isLoading && (
          <p className="p-6 text-sm text-admin-muted">Завантаження…</p>
        )}
        {error && (
          <p className="p-6 text-sm text-red-600">{(error as Error).message}</p>
        )}
        {data && data.items.length === 0 && (
          <p className="p-6 text-sm text-admin-muted">Відгуків не знайдено.</p>
        )}
        {data && data.items.length > 0 && (
          <>
            <table className="w-full text-left text-sm">
              <thead className="border-b border-admin-border bg-gray-50 text-xs uppercase text-admin-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Дата</th>
                  <th className="px-4 py-3 font-medium">Товар</th>
                  <th className="px-4 py-3 font-medium">Автор</th>
                  <th className="px-4 py-3 font-medium">Оцінка</th>
                  <th className="px-4 py-3 font-medium">Статус</th>
                  <th className="px-4 py-3 font-medium">Текст</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {data.items.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-admin-border last:border-0"
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-admin-muted">
                      {formatDate(r.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{r.product.name}</p>
                      <p className="text-xs text-admin-muted">{r.product.slug}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p>{r.authorDisplayName}</p>
                      <p className="text-xs text-admin-muted">{r.customer.email}</p>
                      {r.verifiedPurchase ? (
                        <span className="mt-1 inline-block text-[11px] text-[#5C97A8]">
                          Перевірена покупка
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">{r.rating} / 5</td>
                    <td className="px-4 py-3">
                      <Badge tone={reviewStatusTone(r.status)}>
                        {REVIEW_STATUS_LABELS[r.status] ?? r.status}
                      </Badge>
                    </td>
                    <td className="max-w-xs px-4 py-3">
                      <p className="line-clamp-2 text-admin-muted">{r.body}</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/reviews/${r.id}`}
                        className="text-sm font-medium text-admin-primary hover:underline"
                      >
                        Відкрити
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.totalPages > 1 ? (
              <div className="flex items-center justify-between border-t border-admin-border px-4 py-3">
                <p className="text-xs text-admin-muted">
                  Сторінка {data.page} з {data.totalPages}
                </p>
                <div className="flex gap-2">
                  {data.page > 1 ? (
                    <Link
                      href={`/reviews?${new URLSearchParams({
                        ...(status ? { status } : {}),
                        ...(q ? { q } : {}),
                        page: String(data.page - 1),
                      })}`}
                      className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
                    >
                      Назад
                    </Link>
                  ) : null}
                  {data.page < data.totalPages ? (
                    <Link
                      href={`/reviews?${new URLSearchParams({
                        ...(status ? { status } : {}),
                        ...(q ? { q } : {}),
                        page: String(data.page + 1),
                      })}`}
                      className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
                    >
                      Далі
                    </Link>
                  ) : null}
                </div>
              </div>
            ) : null}
          </>
        )}
      </Card>
    </>
  );
}

export default function ReviewsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-admin-muted">Завантаження…</p>}>
      <ReviewsPageContent />
    </Suspense>
  );
}
