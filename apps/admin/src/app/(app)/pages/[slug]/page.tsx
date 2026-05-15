"use client";

import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { adminFetch, ApiError } from "@/lib/api";
import type { ContentPage } from "@/lib/types";
import { PageForm, type PageFormValues } from "@/components/PageForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/providers/ToastProvider";

export default function EditPagePage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const toast = useToast();
  const qc = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data: pages = [], isLoading } = useQuery({
    queryKey: ["pages"],
    queryFn: () => adminFetch<ContentPage[]>("/admin/pages"),
  });

  const page = pages.find((p) => p.slug === slug);

  const update = useMutation({
    mutationFn: (body: PageFormValues) =>
      adminFetch<ContentPage>(`/admin/pages/${slug}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pages"] });
      toast.success("Збережено");
    },
    onError: (e) =>
      toast.error(e instanceof ApiError ? e.message : "Помилка збереження"),
  });

  const remove = useMutation({
    mutationFn: () =>
      adminFetch<void>(`/admin/pages/${slug}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Сторінку видалено");
      qc.invalidateQueries({ queryKey: ["pages"] });
      router.push("/pages");
    },
    onError: (e) =>
      toast.error(e instanceof ApiError ? e.message : "Не вдалося видалити"),
  });

  if (isLoading) {
    return <p className="text-sm text-admin-muted">Завантаження…</p>;
  }

  if (!page) {
    return <p className="text-sm text-red-600">Сторінку не знайдено</p>;
  }

  return (
    <>
      <PageHeader title={page.title} backHref="/pages" />
      <PageForm
        slugLocked
        submitting={update.isPending}
        defaultValues={{
          title: page.title,
          slug: page.slug,
          content: page.content,
          seoTitle: page.seoTitle ?? "",
          seoDescription: page.seoDescription ?? "",
        }}
        onSubmit={async (v) => {
          await update.mutateAsync(v);
        }}
        onDelete={() => setConfirmDelete(true)}
      />
      <Modal
        open={confirmDelete}
        title="Видалити сторінку?"
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => remove.mutate()}
        loading={remove.isPending}
      >
        Сторінку «{page.title}» буде видалено безповоротно.
      </Modal>
    </>
  );
}
