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
import { ImageUploadField } from "./ImageUploadField";

const schema = z.object({
  parentId: z.string().optional(),
  name: z.string().min(2, "Мінімум 2 символи"),
  slug: z.string().min(2, "Мінімум 2 символи"),
  description: z.string().optional(),
  bannerImageUrl: z.string().optional(),
  bannerTitle: z.string().optional(),
  bannerSubtitle: z.string().optional(),
  hubImageUrl: z.string().optional(),
  hubSubtitle: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  sortOrder: z.coerce.number().int().min(0),
});

export type CategoryFormValues = z.infer<typeof schema>;

/** Тіло для API: порожні банер-поля → `null` (очистити в БД). */
export type CategoryFormSubmitValues = Omit<
  CategoryFormValues,
  "bannerImageUrl" | "bannerTitle" | "bannerSubtitle" | "hubImageUrl" | "hubSubtitle"
> & {
  bannerImageUrl?: string | null;
  bannerTitle?: string | null;
  bannerSubtitle?: string | null;
  hubImageUrl?: string | null;
  hubSubtitle?: string | null;
};

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
  onSubmit: (values: CategoryFormSubmitValues) => Promise<void>;
  onDelete?: () => void;
  submitting?: boolean;
}) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
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
          bannerImageUrl: values.bannerImageUrl?.trim() || null,
          bannerTitle: values.bannerTitle?.trim() || null,
          bannerSubtitle: values.bannerSubtitle?.trim() || null,
          hubImageUrl: values.hubImageUrl?.trim() || null,
          hubSubtitle: values.hubSubtitle?.trim() || null,
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
          label="Порядок у навігації та на /catalog"
          type="number"
          hint="Менше число — вище в меню та на сторінці вибору розділу (лише для кореневих категорій)"
          {...register("sortOrder")}
          error={errors.sortOrder?.message}
        />
        <Textarea label="Опис" rows={3} {...register("description")} />
      </Card>

      <Card className="space-y-4 p-6">
        <h2 className="text-sm font-semibold text-gray-900">Плитка на /catalog</h2>
        <p className="text-xs text-gray-500">
          Для кореневих категорій (без батьківської): картинка та підзаголовок на
          сторінці вибору розділу. Назва плитки — поле «Назва».
        </p>
        <ImageUploadField
          label="Зображення плитки"
          hint="Завантажте файл або вставте URL. Назва плитки — поле «Назва»."
          value={watch("hubImageUrl") ?? ""}
          onChange={(url) =>
            setValue("hubImageUrl", url, { shouldDirty: true })
          }
        />
        <Input
          label="Підзаголовок на плитці"
          hint="Необовʼязково; інакше використовується «Опис»"
          {...register("hubSubtitle")}
        />
      </Card>

      <Card className="space-y-4 p-6">
        <h2 className="text-sm font-semibold text-gray-900">Банер каталогу</h2>
        <p className="text-xs text-gray-500">
          Зображення та тексти на сторінці категорії на вітрині. Заголовок і
          підзаголовок необовʼязкові — якщо обидва порожні, на банері буде лише
          картинка (назва категорії лишається під банером).
        </p>
        <ImageUploadField
          label="Зображення банера"
          hint="Завантажте файл або вставте URL"
          value={watch("bannerImageUrl") ?? ""}
          onChange={(url) =>
            setValue("bannerImageUrl", url, { shouldDirty: true })
          }
        />
        <Input
          label="Заголовок на банері"
          hint="Необовʼязково"
          {...register("bannerTitle")}
        />
        <Input
          label="Підзаголовок на банері"
          hint="Необовʼязково"
          {...register("bannerSubtitle")}
        />
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
