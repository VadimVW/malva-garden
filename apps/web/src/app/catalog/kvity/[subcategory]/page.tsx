import { notFound } from "next/navigation";
import MalvaGardenCatalogDesktop from "@/components/figma/MalvaGardenCatalogDesktop";
import { apiFetch } from "@/lib/api";
import { loadCatalogPage } from "@/lib/loadCatalogPage";

const VALID = new Set(["odnorichni", "bagatorichni", "hrizantemy"]);

type CategoryMeta = {
  category: { id: string; name: string; slug: string };
};

export default async function KvitySubcategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ subcategory: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { subcategory } = await params;
  const { page: pageRaw } = await searchParams;
  if (!VALID.has(subcategory)) notFound();

  const meta = await apiFetch<CategoryMeta>(`/categories/${subcategory}`).catch(() => null);
  if (!meta) notFound();

  const basePath = `/catalog/kvity/${subcategory}`;
  const { products, pagination } = await loadCatalogPage({
    basePath,
    categorySlug: subcategory,
    pageRaw,
  });

  return (
    <div className="min-h-screen w-full bg-[#F5F5F5]">
      <MalvaGardenCatalogDesktop
        gridProducts={products}
        sectionTitle={meta.category.name}
        sectionDescription="Товари цієї підкатегорії"
        breadcrumbs={[
          { label: "Квіти", href: "/catalog/kvity" },
          { label: meta.category.name },
        ]}
        activeNavSection="flowers"
        paginationBasePath={basePath}
        pagination={pagination}
      />
    </div>
  );
}
