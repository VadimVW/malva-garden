import { MalvaGardenFigmaPageShell } from "@/components/figma/MalvaGardenFigmaPageShell";

type Props = {
  title: string;
  content: string;
};

export function MalvaGardenContentPageDesktop({ title, content }: Props) {
  return (
    <MalvaGardenFigmaPageShell breadcrumbs={[{ label: title }]} title={title}>
      <article
        className="rounded-2xl bg-white p-6 shadow-[0px_6px_20px_rgba(0,0,0,0.08)] sm:p-10 [&_a]:text-[#5C97A8] [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-[#5C97A8]/40 [&_blockquote]:pl-4 [&_blockquote]:italic [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-[20px] [&_h2]:font-bold [&_h2]:text-black [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-[17px] [&_h3]:font-semibold [&_li]:ml-5 [&_ol]:list-decimal [&_p]:mb-4 [&_p]:text-[15px] [&_p]:leading-relaxed [&_p]:text-[#333] [&_strong]:font-semibold [&_ul]:list-disc"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </MalvaGardenFigmaPageShell>
  );
}
