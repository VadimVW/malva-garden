import type { Metadata } from "next";
import MalvaGardenCatalogDesktop from "@/components/figma/MalvaGardenCatalogDesktop";
import { loadCatalogPage } from "@/lib/loadCatalogPage";
import { metadataForCategorySlug } from "@/lib/seo/metadata";
import { SITE_NAME } from "@/lib/seo/site";

const BASE_PATH = "/catalog/dekoratyvni-kushi";

export async function generateMetadata(): Promise<Metadata> {
  return metadataForCategorySlug(
    "dekoratyvni-kushi",
    `Декоративні кущі | ${SITE_NAME}`,
    BASE_PATH,
  );
}

export default async function DekoratyvniKushiCatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageRaw } = await searchParams;
  const { products, pagination } = await loadCatalogPage({
    basePath: BASE_PATH,
    categorySlug: "dekoratyvni-kushi",
    pageRaw,
  });

  return (
    <div className="min-h-screen w-full bg-[#F5F5F5]">
      <MalvaGardenCatalogDesktop
        gridProducts={products}
        sectionTitle="Декоративні кущі"
        sectionDescription="Гортензії, троянди та інші декоративні кущі для саду"
        breadcrumbs={[{ label: "Декоративні кущі" }]}
        activeNavSection="shrubs"
        paginationBasePath={BASE_PATH}
        pagination={pagination}
      />
    </div>
  );
}
