"use client";

import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { adminFetch, ApiError } from "@/lib/api";
import type { Category, Product } from "@/lib/types";
import { ProductForm, type ProductFormValues } from "@/components/ProductForm";
import { ProductImagesSection } from "@/components/ProductImagesSection";
import { PageHeader } from "@/components/ui/PageHeader";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/providers/ToastProvider";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const qc = useQueryClient();
  const [confirmHide, setConfirmHide] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => adminFetch<Category[]>("/admin/categories"),
  });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => adminFetch<Product[]>("/admin/products"),
  });

  const product = products.find((p) => p.id === id);

  const update = useMutation({
    mutationFn: (body: ProductFormValues) =>
      adminFetch<Product>(`/admin/products/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      toast.success("Збережено");
    },
    onError: (e) =>
      toast.error(e instanceof ApiError ? e.message : "Помилка збереження"),
  });

  const hide = useMutation({
    mutationFn: () =>
      adminFetch(`/admin/products/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Товар приховано");
      qc.invalidateQueries({ queryKey: ["products"] });
      router.push("/products");
    },
    onError: (e) =>
      toast.error(e instanceof ApiError ? e.message : "Помилка"),
  });

  if (isLoading) {
    return <p className="text-sm text-admin-muted">Завантаження…</p>;
  }

  if (!product) {
    return <p className="text-sm text-red-600">Товар не знайдено</p>;
  }

  const price =
    typeof product.price === "string"
      ? Number(product.price)
      : Number(String(product.price));

  return (
    <>
      <PageHeader title={product.name} backHref="/products" />
      <div className="grid gap-8 xl:grid-cols-2">
        <ProductForm
          categories={categories}
          submitting={update.isPending}
          lowStock={product.stockQuantity <= 3}
          defaultValues={{
            name: product.name,
            slug: product.slug,
            description: product.description ?? "",
            careDescription: product.careDescription ?? "",
            price,
            stockQuantity: product.stockQuantity,
            status: product.status,
            categoryId: product.categoryId ?? "",
            seoTitle: product.seoTitle ?? "",
            seoDescription: product.seoDescription ?? "",
          }}
          onSubmit={async (v) => {
            await update.mutateAsync(v);
          }}
          onHide={() => setConfirmHide(true)}
        />
        <ProductImagesSection productId={id} images={product.images} />
      </div>
      <Modal
        open={confirmHide}
        title="Приховати товар?"
        onClose={() => setConfirmHide(false)}
        onConfirm={() => hide.mutate()}
        loading={hide.isPending}
      >
        Товар зникне з вітрини (статус HIDDEN). Його можна знову активувати
        через редагування.
      </Modal>
    </>
  );
}
