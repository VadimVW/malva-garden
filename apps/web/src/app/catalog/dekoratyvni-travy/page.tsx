import type { Metadata } from "next";
import MalvaGardenCatalogDesktop from "@/components/figma/MalvaGardenCatalogDesktop";
import { catalogDesktopPropsFromCategoryMeta } from "@/lib/catalogCategory";
import { loadCatalogPage } from "@/lib/loadCatalogPage";
import { metadataForCategorySlug } from "@/lib/seo/metadata";
import { SITE_NAME } from "@/lib/seo/site";

const BASE_PATH = "/catalog/dekoratyvni-travy";
const CATEGORY_SLUG = "dekoratyvni-travy";

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
  const { products, pagination, urlQuery, categoryMeta } = await loadCatalogPage({
    basePath: BASE_PATH,
    categorySlug: CATEGORY_SLUG,
    pageRaw,
    sortRaw,
  });

  const categoryProps = categoryMeta
    ? catalogDesktopPropsFromCategoryMeta(categoryMeta)
    : {
        sectionTitle: "Декоративні трави",
        sectionDescription: "Багаторічні та однорічні декоративні трави",
        bannerImageUrl: null,
        bannerTitle: null,
        bannerSubtitle: null,
        breadcrumbs: [{ label: "Декоративні трави" }],
        activeNavSection: "herbs" as const,
      };

  return (
    <div className="min-h-screen w-full bg-[#F5F5F5]">
      <MalvaGardenCatalogDesktop
        gridProducts={products}
        {...categoryProps}
        paginationBasePath={BASE_PATH}
        pagination={pagination}
        paginationQuery={urlQuery}
      />
    </div>
  );
}
