import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MalvaGardenCatalogDesktop from "@/components/figma/MalvaGardenCatalogDesktop";
import { catalogDesktopPropsFromCategoryMeta } from "@/lib/catalogCategory";
import { loadCatalogPage } from "@/lib/loadCatalogPage";
import { metadataForCategorySlug } from "@/lib/seo/metadata";

const VALID = new Set(["hortenzii", "barbaris", "trojanda", "klimatis"]);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sub: string }>;
}): Promise<Metadata> {
  const { sub } = await params;
  if (!VALID.has(sub)) return { title: "Каталог" };
  return metadataForCategorySlug(sub, sub, `/catalog/dekoratyvni-kushi/${sub}`);
}

export default async function DekoratyvniKushiSubPage({
  params,
  searchParams,
}: {
  params: Promise<{ sub: string }>;
  searchParams: Promise<{ page?: string; sort?: string }>;
}) {
  const { sub } = await params;
  const { page: pageRaw, sort: sortRaw } = await searchParams;
  if (!VALID.has(sub)) notFound();

  const basePath = `/catalog/dekoratyvni-kushi/${sub}`;
  const { products, pagination, urlQuery, categoryMeta } = await loadCatalogPage({
    basePath,
    categorySlug: sub,
    pageRaw,
    sortRaw,
  });

  if (!categoryMeta) notFound();

  return (
    <div className="min-h-screen w-full bg-[#F5F5F5]">
      <MalvaGardenCatalogDesktop
        gridProducts={products}
        {...catalogDesktopPropsFromCategoryMeta(categoryMeta)}
        activeNavSection="shrubs"
        paginationBasePath={basePath}
        pagination={pagination}
        paginationQuery={urlQuery}
      />
    </div>
  );
}
