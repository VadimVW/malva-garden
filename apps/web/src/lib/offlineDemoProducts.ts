import type { MalvaGardenProductPayload } from "@/components/figma/MalvaGardenProductDesktop";

/** Мінімальний офлайн-фолбек (перший товар каталогу з seed), якщо API недоступний. */
const OFFLINE_BY_SLUG: Record<string, MalvaGardenProductPayload> = {
  "trojanda-chajno-gibrydna-avalanzh": {
    id: "offline-trojanda-avalanzh",
    name: "Троянда чайно гібридна Аваланж",
    slug: "trojanda-chajno-gibrydna-avalanzh",
    price: "249",
    stockQuantity: 18,
    description:
      "Елегантна біла троянда з великими бутонами для саду та зрізу.",
    careDescription: "Сонячне місце, регулярний полив, обрізка навесні.",
    category: { name: "Квіти", slug: "kvity" },
    images: [
      {
        imageUrl:
          "https://placehold.co/600x600/e8f4f0/5C97A8/png?text=trojanda-chajno-gibrydna",
        altText: "Троянда чайно гібридна Аваланж",
        isMain: true,
      },
    ],
  },
};

export function getOfflineProductPayload(
  slug: string,
): MalvaGardenProductPayload | null {
  return OFFLINE_BY_SLUG[slug] ?? null;
}
