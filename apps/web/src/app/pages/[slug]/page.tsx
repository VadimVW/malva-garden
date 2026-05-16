import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MalvaGardenContentPageDesktop } from "@/components/figma/MalvaGardenContentPageDesktop";
import { apiFetch } from "@/lib/api";

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
  return {
    title: page.seoTitle ?? `${page.title} | Malva Garden`,
    description: page.seoDescription ?? undefined,
  };
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
