"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { Category, ProductStatus } from "@/lib/types";
import { categorySelectOptions } from "@/lib/category-tree";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";
import { Textarea } from "./ui/Textarea";
import { Card } from "./ui/Card";

const schema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional(),
  careDescription: z.string().optional(),
  price: z.coerce.number().min(0),
  stockQuantity: z.coerce.number().int().min(0),
  status: z.enum(["ACTIVE", "HIDDEN"]),
  categoryId: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

export type ProductFormValues = z.infer<typeof schema>;

const statusOptions = [
  { value: "ACTIVE", label: "Активний" },
  { value: "HIDDEN", label: "Прихований" },
];

export function ProductForm({
  categories,
  defaultValues,
  onSubmit,
  onHide,
  submitting,
  lowStock,
}: {
  categories: Category[];
  defaultValues?: Partial<ProductFormValues>;
  onSubmit: (values: ProductFormValues) => Promise<void>;
  onHide?: () => void;
  submitting?: boolean;
  lowStock?: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      status: "ACTIVE" as ProductStatus,
      stockQuantity: 0,
      price: 0,
      categoryId: "",
      ...defaultValues,
    },
  });

  const categoryOptions = [
    { value: "", label: "— Без категорії —" },
    ...categorySelectOptions(categories).filter((o) => o.value !== ""),
  ];

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        await onSubmit({
          ...values,
          categoryId: values.categoryId || undefined,
          description: values.description || undefined,
          careDescription: values.careDescription || undefined,
          seoTitle: values.seoTitle || undefined,
          seoDescription: values.seoDescription || undefined,
        });
      })}
      className="space-y-6"
    >
      {lowStock && (
        <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Увага: низький залишок на складі.
        </p>
      )}
      <Card className="space-y-4 p-6">
        <h2 className="text-sm font-semibold text-gray-900">Основне</h2>
        <Input label="Назва" {...register("name")} error={errors.name?.message} />
        <Input label="Slug" {...register("slug")} error={errors.slug?.message} />
        <Select
          label="Категорія"
          options={categoryOptions}
          {...register("categoryId")}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Ціна, грн"
            type="number"
            step="0.01"
            {...register("price")}
            error={errors.price?.message}
          />
          <Input
            label="Залишок"
            type="number"
            {...register("stockQuantity")}
            error={errors.stockQuantity?.message}
          />
        </div>
        <Select label="Статус" options={statusOptions} {...register("status")} />
        <Textarea label="Опис" rows={4} {...register("description")} />
        <Textarea label="Догляд" rows={4} {...register("careDescription")} />
      </Card>

      <Card className="space-y-4 p-6">
        <h2 className="text-sm font-semibold text-gray-900">SEO</h2>
        <Input label="SEO заголовок" {...register("seoTitle")} />
        <Textarea label="SEO опис" rows={2} {...register("seoDescription")} />
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Збереження…" : "Зберегти"}
        </Button>
        {onHide && (
          <Button type="button" variant="danger" onClick={onHide}>
            Приховати товар
          </Button>
        )}
      </div>
    </form>
  );
}
