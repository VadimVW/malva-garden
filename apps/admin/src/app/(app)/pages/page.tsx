"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api";
import type { ContentPage } from "@/lib/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function PagesListPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["pages"],
    queryFn: () => adminFetch<ContentPage[]>("/admin/pages"),
  });

  return (
    <>
      <PageHeader
        title="Сторінки"
        description="Інфо-сторінки вітрини (/pages/[slug])"
        action={
          <Link href="/pages/new">
            <Button>Нова сторінка</Button>
          </Link>
        }
      />
      <Card className="overflow-hidden">
        {isLoading && (
          <p className="p-6 text-sm text-admin-muted">Завантаження…</p>
        )}
        {error && (
          <p className="p-6 text-sm text-red-600">{(error as Error).message}</p>
        )}
        {data && data.length === 0 && (
          <p className="p-6 text-sm text-admin-muted">Сторінок ще немає.</p>
        )}
        {data && data.length > 0 && (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-admin-border bg-gray-50 text-xs uppercase text-admin-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Заголовок</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {data.map((p) => (
                <tr key={p.id} className="border-b border-admin-border">
                  <td className="px-4 py-3 font-medium">{p.title}</td>
                  <td className="px-4 py-3 font-mono text-xs text-admin-muted">
                    {p.slug}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/pages/${p.slug}`}
                      className="text-admin-primary hover:underline"
                    >
                      Редагувати
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </>
  );
}
