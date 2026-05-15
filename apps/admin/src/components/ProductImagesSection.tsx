"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminFetch, ApiError } from "@/lib/api";
import type { ProductImage } from "@/lib/types";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Card } from "./ui/Card";
import { useToast } from "@/providers/ToastProvider";

export function ProductImagesSection({
  productId,
  images,
}: {
  productId: string;
  images: ProductImage[];
}) {
  const toast = useToast();
  const qc = useQueryClient();
  const [imageUrl, setImageUrl] = useState("");
  const [altText, setAltText] = useState("");

  const sorted = [...images].sort((a, b) => a.sortOrder - b.sortOrder);

  const invalidate = () =>
    qc.invalidateQueries({ queryKey: ["products"] });

  const addImage = useMutation({
    mutationFn: () =>
      adminFetch<ProductImage>(`/admin/products/${productId}/images`, {
        method: "POST",
        body: JSON.stringify({
          imageUrl,
          altText: altText || undefined,
          isMain: sorted.length === 0,
        }),
      }),
    onSuccess: () => {
      toast.success("Зображення додано");
      setImageUrl("");
      setAltText("");
      invalidate();
    },
    onError: (e) =>
      toast.error(e instanceof ApiError ? e.message : "Помилка"),
  });

  const patchImage = useMutation({
    mutationFn: ({
      imageId,
      body,
    }: {
      imageId: string;
      body: Record<string, unknown>;
    }) =>
      adminFetch(`/admin/products/${productId}/images/${imageId}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      toast.success("Оновлено");
      invalidate();
    },
    onError: (e) =>
      toast.error(e instanceof ApiError ? e.message : "Помилка"),
  });

  const deleteImage = useMutation({
    mutationFn: (imageId: string) =>
      adminFetch(`/admin/products/${productId}/images/${imageId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      toast.success("Зображення видалено");
      invalidate();
    },
    onError: (e) =>
      toast.error(e instanceof ApiError ? e.message : "Помилка"),
  });

  return (
    <Card className="space-y-4 p-6">
      <h2 className="text-sm font-semibold text-gray-900">Зображення</h2>
      {sorted.length === 0 && (
        <p className="text-sm text-admin-muted">Ще немає зображень.</p>
      )}
      <ul className="space-y-3">
        {sorted.map((img) => (
          <li
            key={img.id}
            className="flex flex-wrap items-center gap-4 rounded-lg border border-admin-border p-3"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.imageUrl}
              alt={img.altText ?? ""}
              className="h-16 w-16 rounded object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs text-admin-muted">{img.imageUrl}</p>
              {img.isMain && (
                <span className="mt-1 inline-block text-xs font-medium text-emerald-700">
                  Головне
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {!img.isMain && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    patchImage.mutate({ imageId: img.id, body: { isMain: true } })
                  }
                >
                  Зробити головним
                </Button>
              )}
              <Button
                type="button"
                variant="danger"
                onClick={() => deleteImage.mutate(img.id)}
              >
                Видалити
              </Button>
            </div>
          </li>
        ))}
      </ul>
      <div className="grid gap-3 border-t border-admin-border pt-4 sm:grid-cols-2">
        <Input
          label="URL зображення"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
        <Input
          label="Alt текст"
          value={altText}
          onChange={(e) => setAltText(e.target.value)}
        />
      </div>
      <Button
        type="button"
        disabled={!imageUrl || addImage.isPending}
        onClick={() => addImage.mutate()}
      >
        Додати зображення
      </Button>
    </Card>
  );
}
