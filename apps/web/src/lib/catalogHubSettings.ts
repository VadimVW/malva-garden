import { apiFetch } from "@/lib/api";
import {
  fetchCategoryTree,
  hubSectionFromRoot,
  type CatalogHubSectionContent,
} from "@/lib/catalogTree";

/** Ключі `SiteSetting` лише для заголовка hub `/catalog`. */
export const CATALOG_HUB_SETTING_KEYS = {
  title: "catalog_hub_title",
  subtitle: "catalog_hub_subtitle",
} as const;

export type CatalogHubContent = {
  title: string;
  subtitle: string;
  sections: CatalogHubSectionContent[];
};

export type { CatalogHubSectionContent };

const DEFAULT_HUB: CatalogHubContent = {
  title: "Оберіть розділ каталогу",
  subtitle: "Оберіть категорію, щоб переглянути товари.",
  sections: [],
};

type SiteSettingRow = { key: string; value: string };

function settingValue(
  map: Map<string, string>,
  key: string,
  fallback: string,
): string {
  const v = map.get(key)?.trim();
  return v && v.length > 0 ? v : fallback;
}

export async function loadCatalogHubContent(): Promise<CatalogHubContent> {
  try {
    const [settings, roots] = await Promise.all([
      apiFetch<SiteSettingRow[]>("/site-settings"),
      fetchCategoryTree(),
    ]);
    const map = new Map(settings.map((r) => [r.key, r.value]));
    return {
      title: settingValue(
        map,
        CATALOG_HUB_SETTING_KEYS.title,
        DEFAULT_HUB.title,
      ),
      subtitle: settingValue(
        map,
        CATALOG_HUB_SETTING_KEYS.subtitle,
        DEFAULT_HUB.subtitle,
      ),
      sections: roots.map(hubSectionFromRoot),
    };
  } catch {
    return DEFAULT_HUB;
  }
}
