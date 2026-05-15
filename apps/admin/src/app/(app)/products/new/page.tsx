"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { adminFetch, ApiError } from "@/lib/api";
import type { Category, Product } from "@/lib/types";
import { ProductForm, type ProductFormValues } from "@/components/ProductForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { useToast } from "@/providers/ToastProvider";

export default function NewProductPage() {
  const router = useRouter();
  const toast = useToast();
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => adminFetch<Category[]>("/admin/categories"),
  });

  const create = useMutation({
    mutationFn: (body: ProductFormValues) =>
      adminFetch<Product>("/admin/products", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: (p) => {
      toast.success("Товар створено");
      router.push(`/products/${p.id}`);
    },
    onError: (e) =>
      toast.error(e instanceof ApiError ? e.message : "Помилка збереження"),
  });

  return (
    <>
      <PageHeader title="Новий товар" backHref="/products" />
      <ProductForm
        categories={categories}
        submitting={create.isPending}
        onSubmit={async (v) => {
          await create.mutateAsync(v);
        }}
      />
    </>
  );
}
