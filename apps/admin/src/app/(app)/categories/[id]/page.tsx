"use client";

import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { adminFetch, ApiError } from "@/lib/api";
import type { Category } from "@/lib/types";
import { CategoryForm, type CategoryFormValues } from "@/components/CategoryForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/providers/ToastProvider";

export default function EditCategoryPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const qc = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => adminFetch<Category[]>("/admin/categories"),
  });

  const category = categories.find((c) => c.id === id);

  const update = useMutation({
    mutationFn: (body: CategoryFormValues) =>
      adminFetch<Category>(`/admin/categories/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Збережено");
    },
    onError: (e) =>
      toast.error(e instanceof ApiError ? e.message : "Помилка збереження"),
  });

  const remove = useMutation({
    mutationFn: () =>
      adminFetch<void>(`/admin/categories/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Категорію видалено");
      qc.invalidateQueries({ queryKey: ["categories"] });
      router.push("/categories");
    },
    onError: (e) =>
      toast.error(e instanceof ApiError ? e.message : "Не вдалося видалити"),
  });

  if (!category && categories.length > 0) {
    return <p className="text-sm text-red-600">Категорію не знайдено</p>;
  }

  if (!category) {
    return <p className="text-sm text-admin-muted">Завантаження…</p>;
  }

  return (
    <>
      <PageHeader title={category.name} backHref="/categories" />
      <CategoryForm
        categories={categories}
        excludeId={id}
        submitting={update.isPending}
        defaultValues={{
          parentId: category.parentId ?? "",
          name: category.name,
          slug: category.slug,
          description: category.description ?? "",
          imageUrl: category.imageUrl ?? "",
          seoTitle: category.seoTitle ?? "",
          seoDescription: category.seoDescription ?? "",
          sortOrder: category.sortOrder,
        }}
        onSubmit={async (v) => {
          await update.mutateAsync(v);
        }}
        onDelete={() => setConfirmDelete(true)}
      />
      <Modal
        open={confirmDelete}
        title="Видалити категорію?"
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => remove.mutate()}
        loading={remove.isPending}
      >
        Категорію «{category.name}» буде видалено, якщо в ній немає товарів і
        підкатегорій.
      </Modal>
    </>
  );
}
