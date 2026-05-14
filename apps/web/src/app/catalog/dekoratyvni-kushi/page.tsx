import MalvaGardenCatalogDesktop from "@/components/figma/MalvaGardenCatalogDesktop";
import { fetchCatalogGridProducts } from "@/lib/catalogGridFromApi";

export default async function DekoratyvniKushiCatalogPage() {
  const grid = await fetchCatalogGridProducts({ categorySlug: "dekoratyvni-kushi" });
  return (
    <div className="min-h-screen w-full bg-[#F5F5F5]">
      <MalvaGardenCatalogDesktop
        gridProducts={grid}
        sectionTitle="Декоративні кущі"
        sectionDescription="Гортензії, троянди та інші декоративні кущі для саду"
        breadcrumbs={[{ label: "Декоративні кущі" }]}
        activeNavSection="shrubs"
      />
    </div>
  );
}
