import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MalvaGardenCatalogDesktop from "@/components/figma/MalvaGardenCatalogDesktop";
import { catalogDesktopPropsFromCategoryMeta } from "@/lib/catalogCategory";
import { loadCatalogPage } from "@/lib/loadCatalogPage";
import { metadataForCategorySlug } from "@/lib/seo/metadata";

const VALID = new Set(["odnorichni", "bagatorichni", "hrizantemy"]);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ subcategory: string }>;
}): Promise<Metadata> {
  const { subcategory } = await params;
  if (!VALID.has(subcategory)) return { title: "Каталог" };
  return metadataForCategorySlug(
    subcategory,
    subcategory,
    `/catalog/kvity/${subcategory}`,
  );
}

export default async function KvitySubcategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ subcategory: string }>;
  searchParams: Promise<{ page?: string; sort?: string }>;
}) {
  const { subcategory } = await params;
  const { page: pageRaw, sort: sortRaw } = await searchParams;
  if (!VALID.has(subcategory)) notFound();

  const basePath = `/catalog/kvity/${subcategory}`;
  const { products, pagination, urlQuery, categoryMeta } = await loadCatalogPage({
    basePath,
    categorySlug: subcategory,
    pageRaw,
    sortRaw,
  });

  if (!categoryMeta) notFound();

  return (
    <div className="min-h-screen w-full bg-[#F5F5F5]">
      <MalvaGardenCatalogDesktop
        gridProducts={products}
        {...catalogDesktopPropsFromCategoryMeta(categoryMeta)}
        paginationBasePath={basePath}
        pagination={pagination}
        paginationQuery={urlQuery}
      />
    </div>
  );
}
