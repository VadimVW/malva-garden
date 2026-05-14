import type { MalvaGardenProductPayload } from "@/components/figma/MalvaGardenProductDesktop";

/**
 * Товари з `apps/api/prisma/seed.ts`, якщо API недоступний або БД ще не засіяна.
 * Поля узгоджені з публічним відповідником `/products/:slug`.
 */
const OFFLINE_BY_SLUG: Record<string, MalvaGardenProductPayload> = {
  "petuniya-miks": {
    id: "offline-seed-petuniya-miks",
    name: "Петунія мікс",
    slug: "petuniya-miks",
    price: "49.9",
    stockQuantity: 120,
    description: "Насіння петунії суміш кольорів.",
    careDescription: "Розсаду висаджувати після заморозків.",
    category: { name: "Однорічні", slug: "odnorichni" },
    images: [
      {
        imageUrl: "https://placehold.co/600x600/png?text=Petunia",
        altText: "Петунія",
        isMain: true,
      },
    ],
  },
  "pomidor-cherry": {
    id: "offline-seed-pomidor-cherry",
    name: "Помідор черрі",
    slug: "pomidor-cherry",
    price: "35",
    stockQuantity: 0,
    description: "Солодкі черрі для теплиці та відкритого ґрунту.",
    careDescription: null,
    category: { name: "Овочі", slug: "ovochi" },
    images: [],
  },
};

export function getOfflineProductPayload(
  slug: string,
): MalvaGardenProductPayload | null {
  return OFFLINE_BY_SLUG[slug] ?? null;
}
