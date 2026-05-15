"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { adminFetch, ApiError } from "@/lib/api";
import type { Category } from "@/lib/types";
import { CategoryForm, type CategoryFormValues } from "@/components/CategoryForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { useToast } from "@/providers/ToastProvider";

export default function NewCategoryPage() {
  const router = useRouter();
  const toast = useToast();
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => adminFetch<Category[]>("/admin/categories"),
  });

  const create = useMutation({
    mutationFn: (body: CategoryFormValues) =>
      adminFetch<Category>("/admin/categories", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: (cat) => {
      toast.success("Категорію створено");
      router.push(`/categories/${cat.id}`);
    },
    onError: (e) =>
      toast.error(e instanceof ApiError ? e.message : "Помилка збереження"),
  });

  return (
    <>
      <PageHeader
        title="Нова категорія"
        backHref="/categories"
      />
      <CategoryForm
        categories={categories}
        submitting={create.isPending}
        onSubmit={async (v) => {
          await create.mutateAsync(v);
        }}
      />
    </>
  );
}
