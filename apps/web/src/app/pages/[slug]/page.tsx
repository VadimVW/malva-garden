import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api";

type PageDto = {
  title: string;
  slug: string;
  content: string;
  seoTitle: string | null;
  seoDescription: string | null;
};

export default async function ContentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await apiFetch<PageDto>(`/pages/${slug}`).catch(() => null);
  if (!page) notFound();

  return (
    <article className="mx-auto max-w-3xl space-y-4 px-4 py-10">
      <h1 className="text-2xl font-semibold">{page.title}</h1>
      <div
        className="space-y-3 text-sm leading-relaxed text-slate-700 [&_a]:text-emerald-800 [&_a]:underline"
        dangerouslySetInnerHTML={{ __html: page.content }}
      />
    </article>
  );
}
