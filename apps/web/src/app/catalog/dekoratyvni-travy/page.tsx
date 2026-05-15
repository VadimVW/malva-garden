import MalvaGardenCatalogDesktop from "@/components/figma/MalvaGardenCatalogDesktop";
import { loadCatalogPage } from "@/lib/loadCatalogPage";

const BASE_PATH = "/catalog/dekoratyvni-travy";

export default async function DekoratyvniTravyCatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageRaw } = await searchParams;
  const { products, pagination } = await loadCatalogPage({
    basePath: BASE_PATH,
    categorySlug: "dekoratyvni-travy",
    pageRaw,
  });

  return (
    <div className="min-h-screen w-full bg-[#F5F5F5]">
      <MalvaGardenCatalogDesktop
        gridProducts={products}
        sectionTitle="Декоративні трави"
        sectionDescription="Багаторічні та однорічні декоративні трави"
        breadcrumbs={[{ label: "Декоративні трави" }]}
        activeNavSection="herbs"
        paginationBasePath={BASE_PATH}
        pagination={pagination}
      />
    </div>
  );
}
