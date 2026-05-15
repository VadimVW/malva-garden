"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { Category } from "@/lib/types";
import { categorySelectOptions } from "@/lib/category-tree";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";
import { Textarea } from "./ui/Textarea";
import { Card } from "./ui/Card";

const schema = z.object({
  parentId: z.string().optional(),
  name: z.string().min(2, "Мінімум 2 символи"),
  slug: z.string().min(2, "Мінімум 2 символи"),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  sortOrder: z.coerce.number().int().min(0),
});

export type CategoryFormValues = z.infer<typeof schema>;

export function CategoryForm({
  categories,
  defaultValues,
  excludeId,
  onSubmit,
  onDelete,
  submitting,
}: {
  categories: Category[];
  defaultValues?: Partial<CategoryFormValues>;
  excludeId?: string;
  onSubmit: (values: CategoryFormValues) => Promise<void>;
  onDelete?: () => void;
  submitting?: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      parentId: "",
      sortOrder: 0,
      ...defaultValues,
    },
  });

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        await onSubmit({
          ...values,
          parentId: values.parentId || undefined,
          description: values.description || undefined,
          imageUrl: values.imageUrl || undefined,
          seoTitle: values.seoTitle || undefined,
          seoDescription: values.seoDescription || undefined,
        });
      })}
      className="space-y-6"
    >
      <Card className="space-y-4 p-6">
        <h2 className="text-sm font-semibold text-gray-900">Основне</h2>
        <Select
          label="Батьківська категорія"
          options={categorySelectOptions(categories, excludeId)}
          {...register("parentId")}
        />
        <Input label="Назва" {...register("name")} error={errors.name?.message} />
        <Input
          label="Slug"
          hint="Латиниця, дефіси. Унікальний у всій системі."
          {...register("slug")}
          error={errors.slug?.message}
        />
        <Input
          label="Порядок сортування"
          type="number"
          {...register("sortOrder")}
          error={errors.sortOrder?.message}
        />
        <Textarea label="Опис" rows={3} {...register("description")} />
        <Input label="URL зображення" {...register("imageUrl")} />
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
        {onDelete && (
          <Button type="button" variant="danger" onClick={onDelete}>
            Видалити
          </Button>
        )}
      </div>
    </form>
  );
}
