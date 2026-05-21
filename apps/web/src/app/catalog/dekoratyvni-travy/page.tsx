import type { Metadata } from "next";
import MalvaGardenCatalogDesktop from "@/components/figma/MalvaGardenCatalogDesktop";
import { loadCatalogPage } from "@/lib/loadCatalogPage";
import { metadataForCategorySlug } from "@/lib/seo/metadata";
import { SITE_NAME } from "@/lib/seo/site";

const BASE_PATH = "/catalog/dekoratyvni-travy";

export async function generateMetadata(): Promise<Metadata> {
  return metadataForCategorySlug(
    "dekoratyvni-travy",
    `Декоративні трави | ${SITE_NAME}`,
    BASE_PATH,
  );
}

export default async function DekoratyvniTravyCatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; sort?: string }>;
}) {
  const { page: pageRaw, sort: sortRaw } = await searchParams;
  const { products, pagination, urlQuery } = await loadCatalogPage({
    basePath: BASE_PATH,
    categorySlug: "dekoratyvni-travy",
    pageRaw,
    sortRaw,
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
        paginationQuery={urlQuery}
      />
    </div>
  );
}
