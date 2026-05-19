import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MalvaGardenContentPageDesktop } from "@/components/figma/MalvaGardenContentPageDesktop";
import { apiFetch } from "@/lib/api";
import { buildSeoTitleMetadata } from "@/lib/seo/metadata";
import { SITE_NAME } from "@/lib/seo/site";

type PageDto = {
  title: string;
  slug: string;
  content: string;
  seoTitle: string | null;
  seoDescription: string | null;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await apiFetch<PageDto>(`/pages/${slug}`).catch(() => null);
  if (!page) return { title: "Сторінка" };
  return buildSeoTitleMetadata({
    seoTitle: page.seoTitle,
    fallbackTitle: `${page.title} | ${SITE_NAME}`,
    description: page.seoDescription ?? undefined,
    path: `/pages/${slug}`,
  });
}

export default async function ContentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await apiFetch<PageDto>(`/pages/${slug}`).catch(() => null);
  if (!page) notFound();

  return <MalvaGardenContentPageDesktop title={page.title} content={page.content} />;
}
