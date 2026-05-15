"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api";
import type { Category } from "@/lib/types";
import { flattenCategoryTree } from "@/lib/category-tree";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function CategoriesPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["categories"],
    queryFn: () => adminFetch<Category[]>("/admin/categories"),
  });

  const rows = data ? flattenCategoryTree(data) : [];

  return (
    <>
      <PageHeader
        title="Категорії"
        description="Дерево категорій вітрини та підкатегорій"
        action={
          <Link href="/categories/new">
            <Button>Нова категорія</Button>
          </Link>
        }
      />
      <Card className="overflow-hidden">
        {isLoading && (
          <p className="p-6 text-sm text-admin-muted">Завантаження…</p>
        )}
        {error && (
          <p className="p-6 text-sm text-red-600">
            {(error as Error).message}
          </p>
        )}
        {!isLoading && !error && rows.length === 0 && (
          <p className="p-6 text-sm text-admin-muted">Категорій ще немає.</p>
        )}
        {rows.length > 0 && (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-admin-border bg-gray-50 text-xs uppercase text-admin-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Назва</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Порядок</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} className="border-b border-admin-border last:border-0">
                  <td className="px-4 py-3">
                    <span style={{ paddingLeft: `${c.depth * 1.25}rem` }}>
                      {c.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-admin-muted">
                    {c.slug}
                  </td>
                  <td className="px-4 py-3">{c.sortOrder}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/categories/${c.id}`}
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
