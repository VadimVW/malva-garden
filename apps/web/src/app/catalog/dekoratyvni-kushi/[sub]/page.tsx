import { notFound } from "next/navigation";
import MalvaGardenCatalogDesktop from "@/components/figma/MalvaGardenCatalogDesktop";
import { apiFetch } from "@/lib/api";
import { loadCatalogPage } from "@/lib/loadCatalogPage";

const VALID = new Set(["hortenzii", "barbaris", "trojanda", "klimatis"]);

type CategoryMeta = {
  category: { id: string; name: string; slug: string };
};

export default async function DekoratyvniKushiSubPage({
  params,
  searchParams,
}: {
  params: Promise<{ sub: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { sub } = await params;
  const { page: pageRaw } = await searchParams;
  if (!VALID.has(sub)) notFound();

  const meta = await apiFetch<CategoryMeta>(`/categories/${sub}`).catch(() => null);
  if (!meta) notFound();

  const basePath = `/catalog/dekoratyvni-kushi/${sub}`;
  const { products, pagination } = await loadCatalogPage({
    basePath,
    categorySlug: sub,
    pageRaw,
  });

  return (
    <div className="min-h-screen w-full bg-[#F5F5F5]">
      <MalvaGardenCatalogDesktop
        gridProducts={products}
        sectionTitle={meta.category.name}
        sectionDescription="Товари цієї підкатегорії"
        breadcrumbs={[
          { label: "Декоративні кущі", href: "/catalog/dekoratyvni-kushi" },
          { label: meta.category.name },
        ]}
        activeNavSection="shrubs"
        paginationBasePath={basePath}
        pagination={pagination}
      />
    </div>
  );
}
