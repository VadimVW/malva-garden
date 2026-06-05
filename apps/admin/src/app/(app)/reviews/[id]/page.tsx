"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminFetch, ApiError } from "@/lib/api";
import type { ReviewListItem } from "@/lib/types";
import { formatDate, REVIEW_STATUS_LABELS } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/providers/ToastProvider";

export default function ReviewDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const qc = useQueryClient();
  const [rejectReason, setRejectReason] = useState("");

  const { data: review, isLoading, error } = useQuery({
    queryKey: ["review", id],
    queryFn: () => adminFetch<ReviewListItem>(`/admin/reviews/${id}`),
  });

  const patchStatus = useMutation({
    mutationFn: (body: {
      status: "PUBLISHED" | "REJECTED";
      rejectedReason?: string;
    }) =>
      adminFetch(`/admin/reviews/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["review", id] });
      qc.invalidateQueries({ queryKey: ["reviews"] });
      qc.invalidateQueries({ queryKey: ["reviews-pending-count"] });
      toast.success("Статус відгуку оновлено");
    },
    onError: (e) =>
      toast.error(e instanceof ApiError ? e.message : "Помилка"),
  });

  const removeReview = useMutation({
    mutationFn: () =>
      adminFetch(`/admin/reviews/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reviews"] });
      qc.invalidateQueries({ queryKey: ["reviews-pending-count"] });
      toast.success("Відгук видалено");
      router.push("/reviews");
    },
    onError: (e) =>
      toast.error(e instanceof ApiError ? e.message : "Помилка"),
  });

  if (isLoading) {
    return <p className="text-sm text-admin-muted">Завантаження…</p>;
  }

  if (error || !review) {
    return (
      <p className="text-sm text-red-600">
        {(error as Error)?.message ?? "Відгук не знайдено"}
      </p>
    );
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");

  return (
    <>
      <PageHeader
        title="Відгук"
        description={review.product.name}
        backHref="/reviews"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Badge
              tone={
                review.status === "PENDING"
                  ? "yellow"
                  : review.status === "PUBLISHED"
                    ? "green"
                    : "red"
              }
            >
              {REVIEW_STATUS_LABELS[review.status] ?? review.status}
            </Badge>
            <span className="text-sm text-admin-muted">
              {formatDate(review.createdAt)}
            </span>
          </div>

          <p className="text-lg font-semibold">{review.authorDisplayName}</p>
          <p className="text-sm text-admin-muted">{review.customer.email}</p>
          {review.verifiedPurchase ? (
            <p className="mt-1 text-sm font-medium text-[#5C97A8]">
              Перевірена покупка
            </p>
          ) : null}

          <p className="mt-4 text-sm">
            <span className="font-medium">Оцінка:</span> {review.rating} / 5
          </p>

          <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed">
            {review.body}
          </p>

          {review.rejectedReason ? (
            <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">
              <span className="font-medium">Причина відхилення:</span>{" "}
              {review.rejectedReason}
            </div>
          ) : null}
        </Card>

        <Card className="space-y-4 p-6">
          <div>
            <p className="text-xs font-medium uppercase text-admin-muted">
              Товар
            </p>
            <p className="font-medium">{review.product.name}</p>
            {siteUrl ? (
              <a
                href={`${siteUrl}/product/${review.product.slug}?tab=reviews`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-admin-primary underline"
              >
                Відкрити на вітрині
              </a>
            ) : null}
          </div>

          {review.order ? (
            <div>
              <p className="text-xs font-medium uppercase text-admin-muted">
                Замовлення
              </p>
              <p className="font-mono text-sm">{review.order.orderNumber}</p>
            </div>
          ) : null}

          {review.status === "PENDING" ? (
            <div className="space-y-3 border-t border-admin-border pt-4">
              <Button
                onClick={() => patchStatus.mutate({ status: "PUBLISHED" })}
                disabled={patchStatus.isPending}
              >
                Опублікувати
              </Button>
              <div>
                <Textarea
                  label="Причина відхилення"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                  placeholder="Внутрішня примітка для команди"
                />
                <Button
                  variant="danger"
                  className="mt-2"
                  onClick={() =>
                    patchStatus.mutate({
                      status: "REJECTED",
                      rejectedReason: rejectReason.trim(),
                    })
                  }
                  disabled={
                    patchStatus.isPending || rejectReason.trim().length === 0
                  }
                >
                  Відхилити
                </Button>
              </div>
            </div>
          ) : null}

          <div className="border-t border-admin-border pt-4">
            <Button
              variant="ghost"
              className="text-red-600"
              onClick={() => {
                if (window.confirm("Видалити відгук назавжди?")) {
                  removeReview.mutate();
                }
              }}
              disabled={removeReview.isPending}
            >
              Видалити
            </Button>
          </div>
        </Card>
      </div>
    </>
  );
}
