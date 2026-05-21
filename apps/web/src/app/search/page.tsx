import type { Metadata } from "next";
import MalvaGardenCatalogDesktop from "@/components/figma/MalvaGardenCatalogDesktop";
import { loadCatalogPage } from "@/lib/loadCatalogPage";
import { parseCatalogQuery } from "@/lib/catalogPagination";
import { SITE_NAME } from "@/lib/seo/site";

const BASE_PATH = "/search";

type Props = {
  searchParams: Promise<{ page?: string; q?: string; sort?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q: qRaw } = await searchParams;
  const q = parseCatalogQuery(qRaw);
  if (!q) {
    return { title: `Пошук | ${SITE_NAME}` };
  }
  return { title: `Пошук: ${q} | ${SITE_NAME}` };
}

export default async function SearchPage({ searchParams }: Props) {
  const { page: pageRaw, q: qRaw, sort: sortRaw } = await searchParams;
  const q = parseCatalogQuery(qRaw);

  if (!q) {
    return (
      <div className="min-h-screen w-full bg-[#F5F5F5]">
        <MalvaGardenCatalogDesktop
          gridProducts={[]}
          sectionTitle="Пошук"
          sectionDescription="Введіть назву товару в поле пошуку в шапці сайту"
          breadcrumbs={[
            { label: "Каталог", href: "/catalog" },
            { label: "Пошук" },
          ]}
          showCategoryBanner={false}
          emptyGridMessage="Введіть запит у полі пошуку вгорі сторінки."
        />
      </div>
    );
  }

  const { products, pagination, urlQuery } = await loadCatalogPage({
    basePath: BASE_PATH,
    pageRaw,
    qRaw: q,
    sortRaw,
  });

  const totalLabel =
    pagination.total > 0
      ? `Знайдено ${pagination.total} ${pagination.total === 1 ? "товар" : pagination.total < 5 ? "товари" : "товарів"}`
      : undefined;

  return (
    <div className="min-h-screen w-full bg-[#F5F5F5]">
      <MalvaGardenCatalogDesktop
        gridProducts={products}
        sectionTitle="Результати пошуку"
        sectionDescription={
          totalLabel ? `За запитом «${q}». ${totalLabel}` : `За запитом «${q}»`
        }
        breadcrumbs={[
          { label: "Каталог", href: "/catalog" },
          { label: "Пошук" },
        ]}
        showCategoryBanner={false}
        emptyGridMessage="Нічого не знайдено. Спробуйте інший запит."
        paginationBasePath={BASE_PATH}
        pagination={pagination}
        paginationQuery={urlQuery}
      />
    </div>
  );
}
