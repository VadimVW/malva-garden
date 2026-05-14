import MalvaGardenCatalogDesktop from "@/components/figma/MalvaGardenCatalogDesktop";
import { fetchCatalogGridProducts } from "@/lib/catalogGridFromApi";

export default async function KvityCatalogPage() {
  const grid = await fetchCatalogGridProducts();
  return (
    <div className="min-h-screen w-full bg-[#F5F5F5]">
      <MalvaGardenCatalogDesktop gridProducts={grid} />
    </div>
  );
}
