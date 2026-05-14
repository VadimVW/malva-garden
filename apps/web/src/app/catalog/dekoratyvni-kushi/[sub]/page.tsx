import { notFound } from "next/navigation";
import MalvaGardenCatalogDesktop from "@/components/figma/MalvaGardenCatalogDesktop";
import { apiFetch } from "@/lib/api";
import { fetchCatalogGridProducts } from "@/lib/catalogGridFromApi";

const VALID = new Set(["hortenzii", "barbaris", "trojanda", "klimatis"]);

type CategoryMeta = {
  category: { id: string; name: string; slug: string };
};

export default async function DekoratyvniKushiSubPage({
  params,
}: {
  params: Promise<{ sub: string }>;
}) {
  const { sub } = await params;
  if (!VALID.has(sub)) notFound();

  const meta = await apiFetch<CategoryMeta>(`/categories/${sub}`).catch(() => null);
  if (!meta) notFound();

  const grid = await fetchCatalogGridProducts({ categorySlug: sub });

  return (
    <div className="min-h-screen w-full bg-[#F5F5F5]">
      <MalvaGardenCatalogDesktop
        gridProducts={grid}
        sectionTitle={meta.category.name}
        sectionDescription="Товари цієї підкатегорії"
        breadcrumbs={[
          { label: "Декоративні кущі", href: "/catalog/dekoratyvni-kushi" },
          { label: meta.category.name },
        ]}
        activeNavSection="shrubs"
      />
    </div>
  );
}
