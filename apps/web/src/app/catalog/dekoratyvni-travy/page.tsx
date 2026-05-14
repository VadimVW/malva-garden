import MalvaGardenCatalogDesktop from "@/components/figma/MalvaGardenCatalogDesktop";
import { fetchCatalogGridProducts } from "@/lib/catalogGridFromApi";

export default async function DekoratyvniTravyCatalogPage() {
  const grid = await fetchCatalogGridProducts({ categorySlug: "dekoratyvni-travy" });
  return (
    <div className="min-h-screen w-full bg-[#F5F5F5]">
      <MalvaGardenCatalogDesktop
        gridProducts={grid}
        sectionTitle="Декоративні трави"
        sectionDescription="Багаторічні та однорічні декоративні трави"
        breadcrumbs={[{ label: "Декоративні трави" }]}
        activeNavSection="herbs"
      />
    </div>
  );
}
