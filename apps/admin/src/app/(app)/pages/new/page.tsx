"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { adminFetch, ApiError } from "@/lib/api";
import type { ContentPage } from "@/lib/types";
import { PageForm, type PageFormValues } from "@/components/PageForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { useToast } from "@/providers/ToastProvider";

export default function NewPagePage() {
  const router = useRouter();
  const toast = useToast();

  const create = useMutation({
    mutationFn: (body: PageFormValues) =>
      adminFetch<ContentPage>("/admin/pages", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: (p) => {
      toast.success("Сторінку створено");
      router.push(`/pages/${p.slug}`);
    },
    onError: (e) =>
      toast.error(e instanceof ApiError ? e.message : "Помилка збереження"),
  });

  return (
    <>
      <PageHeader title="Нова сторінка" backHref="/pages" />
      <PageForm
        submitting={create.isPending}
        onSubmit={async (v) => {
          await create.mutateAsync(v);
        }}
      />
    </>
  );
}
