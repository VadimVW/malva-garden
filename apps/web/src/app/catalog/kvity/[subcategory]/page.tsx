import { notFound } from "next/navigation";
import MalvaGardenCatalogDesktop from "@/components/figma/MalvaGardenCatalogDesktop";
import { apiFetch } from "@/lib/api";
import { fetchCatalogGridProducts } from "@/lib/catalogGridFromApi";

const VALID = new Set(["odnorichni", "bagatorichni", "hrizantemy"]);

type CategoryMeta = {
  category: { id: string; name: string; slug: string };
};

export default async function KvitySubcategoryPage({
  params,
}: {
  params: Promise<{ subcategory: string }>;
}) {
  const { subcategory } = await params;
  if (!VALID.has(subcategory)) notFound();

  const meta = await apiFetch<CategoryMeta>(`/categories/${subcategory}`).catch(() => null);
  if (!meta) notFound();

  const grid = await fetchCatalogGridProducts({ categorySlug: subcategory });

  return (
    <div className="min-h-screen w-full bg-[#F5F5F5]">
      <MalvaGardenCatalogDesktop
        gridProducts={grid}
        sectionTitle={meta.category.name}
        sectionDescription="Товари цієї підкатегорії"
        breadcrumbs={[
          { label: "Квіти", href: "/catalog/kvity" },
          { label: meta.category.name },
        ]}
        activeNavSection="flowers"
      />
    </div>
  );
}
