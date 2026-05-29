import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MalvaGardenCatalogDesktop from "@/components/store/MalvaGardenCatalogDesktop";
import {
  catalogDesktopPropsFromCategoryMeta,
  fetchCategoryBySlug,
} from "@/lib/catalogCategory";
import { catalogPathFromSlugs, pathsMatchSegments } from "@/lib/catalogTree";
import { loadCatalogPage } from "@/lib/loadCatalogPage";
import { metadataForCategorySlug } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ segments?: string[] }>;
}): Promise<Metadata> {
  const { segments } = await params;
  if (!segments?.length) return { title: "Каталог" };
  const slug = segments[segments.length - 1]!;
  const basePath = catalogPathFromSlugs(segments);
  return metadataForCategorySlug(slug, slug, basePath);
}

export default async function CatalogCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ segments?: string[] }>;
  searchParams: Promise<{ page?: string; sort?: string; q?: string }>;
}) {
  const { segments } = await params;
  if (!segments?.length) notFound();

  const slug = segments[segments.length - 1]!;
  const basePath = catalogPathFromSlugs(segments);
  const { page: pageRaw, sort: sortRaw, q: qRaw } = await searchParams;

  const categoryMeta = await fetchCategoryBySlug(slug).catch(() => null);
  if (!categoryMeta) notFound();

  if (!pathsMatchSegments(categoryMeta.breadcrumbs, segments)) {
    notFound();
  }

  const { products, pagination, urlQuery } = await loadCatalogPage({
    basePath,
    categorySlug: slug,
    pageRaw,
    sortRaw,
    qRaw,
  });

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
