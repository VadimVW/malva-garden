import type { Metadata } from "next";
import { apiFetch } from "@/lib/api";
import { catalogCategoryHref } from "@/lib/figmaCatalogLinks";
import {
  absoluteUrl,
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE_PATH,
  SITE_NAME,
} from "@/lib/seo/site";

type CategorySeo = {
  category: {
    name: string;
    slug: string;
    seoTitle: string | null;
    seoDescription: string | null;
  };
};

export const NOINDEX_ROBOTS: Metadata["robots"] = {
  index: false,
  follow: false,
  googleBot: { index: false, follow: false },
};

function buildOpenGraph(input: {
  title: string;
  description?: string;
  path: string;
  imageUrl?: string | null;
}): Metadata["openGraph"] {
  return {
    type: "website",
    locale: "uk_UA",
    siteName: SITE_NAME,
    title: input.title,
    description: input.description ?? DEFAULT_DESCRIPTION,
    url: absoluteUrl(input.path),
    images: input.imageUrl
      ? [{ url: input.imageUrl, alt: input.title }]
      : [{ url: absoluteUrl(DEFAULT_OG_IMAGE_PATH), alt: SITE_NAME }],
  };
}

export function buildPageMetadata(input: {
  title: string;
  description?: string;
  path: string;
  imageUrl?: string | null;
  noIndex?: boolean;
}): Metadata {
  return {
    title: input.title,
    description: input.description ?? DEFAULT_DESCRIPTION,
    alternates: { canonical: absoluteUrl(input.path) },
    openGraph: buildOpenGraph(input),
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description ?? DEFAULT_DESCRIPTION,
    },
    ...(input.noIndex ? { robots: NOINDEX_ROBOTS } : {}),
  };
}

export function buildSeoTitleMetadata(input: {
  seoTitle: string | null | undefined;
  fallbackTitle: string;
  description?: string | null;
  path: string;
  imageUrl?: string | null;
  noIndex?: boolean;
}): Metadata {
  const title = input.seoTitle?.trim() || input.fallbackTitle;
  const description =
    input.description?.trim() || DEFAULT_DESCRIPTION;
  const titleField: Metadata["title"] = input.seoTitle?.trim()
    ? { absolute: input.seoTitle.trim() }
    : input.fallbackTitle;

  return {
    title: titleField,
    description,
    alternates: { canonical: absoluteUrl(input.path) },
    openGraph: buildOpenGraph({
      title,
      description,
      path: input.path,
      imageUrl: input.imageUrl,
    }),
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    ...(input.noIndex ? { robots: NOINDEX_ROBOTS } : {}),
  };
}

export async function metadataForCategorySlug(
  categorySlug: string,
  fallbackTitle: string,
  path: string,
): Promise<Metadata> {
  const meta = await apiFetch<CategorySeo>(`/categories/${categorySlug}`).catch(
    () => null,
  );
  if (!meta) {
    return buildPageMetadata({
      title: fallbackTitle,
      path,
    });
  }
  const { category } = meta;
  return buildSeoTitleMetadata({
    seoTitle: category.seoTitle,
    fallbackTitle: category.seoTitle
      ? category.name
      : `${category.name} | ${SITE_NAME}`,
    description:
      category.seoDescription ??
      `Каталог «${category.name}» — ${SITE_NAME}.`,
    path,
  });
}

export const homeMetadata: Metadata = buildPageMetadata({
  title: `${SITE_NAME} — насіння, квіти та садові товари`,
  description: DEFAULT_DESCRIPTION,
  path: "/",
});

export const catalogHubMetadata: Metadata = buildPageMetadata({
  title: `Каталог | ${SITE_NAME}`,
  description:
    "Оберіть розділ каталогу: квіти, декоративні кущі та декоративні трави.",
  path: "/catalog",
});

export function categoryPathFromSlug(slug: string): string {
  return catalogCategoryHref(slug);
}
