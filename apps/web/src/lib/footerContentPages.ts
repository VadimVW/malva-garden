import { cache } from "react";
import { apiFetch } from "@/lib/api";

export type FooterContentPageLink = {
  slug: string;
  title: string;
};

type PagesIndexResponse = {
  items: FooterContentPageLink[];
};

async function loadFooterContentPagesUncached(): Promise<FooterContentPageLink[]> {
  try {
    const data = await apiFetch<PagesIndexResponse>("/pages", {
      revalidateSeconds: 300,
    });
    return data.items ?? [];
  } catch {
    return [];
  }
}

/** Список інфо-сторінок для footer «Клієнтам» (§7.23.4). */
export const loadFooterContentPages = cache(loadFooterContentPagesUncached);
