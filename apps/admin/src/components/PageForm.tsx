"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Textarea } from "./ui/Textarea";
import { Card } from "./ui/Card";

const schema = z.object({
  title: z.string().min(2),
  slug: z.string().min(2),
  content: z.string().min(1),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

export type PageFormValues = z.infer<typeof schema>;

export function PageForm({
  defaultValues,
  slugLocked,
  onSubmit,
  onDelete,
  submitting,
}: {
  defaultValues?: Partial<PageFormValues>;
  slugLocked?: boolean;
  onSubmit: (values: PageFormValues) => Promise<void>;
  onDelete?: () => void;
  submitting?: boolean;
}) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PageFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { content: "", ...defaultValues },
  });

  const content = watch("content");

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        await onSubmit({
          ...values,
          seoTitle: values.seoTitle || undefined,
          seoDescription: values.seoDescription || undefined,
        });
      })}
      className="space-y-6"
    >
      <Card className="space-y-4 p-6">
        <Input label="Заголовок" {...register("title")} error={errors.title?.message} />
        <Input
          label="Slug"
          {...register("slug")}
          readOnly={slugLocked}
          error={errors.slug?.message}
        />
        <Textarea
          label="Контент (HTML)"
          rows={12}
          hint="Дозволені базові HTML-теги. Уникайте небезпечного скрипту."
          {...register("content")}
          error={errors.content?.message}
        />
      </Card>

      <Card className="space-y-4 p-6">
        <h2 className="text-sm font-semibold">Попередній перегляд</h2>
        <div
          className="prose prose-sm max-w-none rounded-lg border border-admin-border bg-gray-50 p-4"
          dangerouslySetInnerHTML={{ __html: content || "<p>—</p>" }}
        />
      </Card>

      <Card className="space-y-4 p-6">
        <h2 className="text-sm font-semibold">SEO</h2>
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
