import {
  PUBLIC_SITE_SETTING_DEFAULTS,
  type PublicSiteSettingKey,
} from "@malva/site-settings";
import { apiFetch } from "@/lib/api";
import {
  fetchCategoryTree,
  hubSectionFromRoot,
  type CatalogHubSectionContent,
} from "@/lib/catalogTree";
import { getSiteSetting, siteSettingsToMap } from "@/lib/siteSettings";

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
  title: PUBLIC_SITE_SETTING_DEFAULTS.catalog_hub_title,
  subtitle: PUBLIC_SITE_SETTING_DEFAULTS.catalog_hub_subtitle,
  sections: [],
};

type SiteSettingRow = { key: string; value: string };

function settingValue(
  map: Map<string, string>,
  key: PublicSiteSettingKey,
  fallback: string,
): string {
  return getSiteSetting(map, key, fallback);
}

export async function loadCatalogHubContent(): Promise<CatalogHubContent> {
  try {
    const [settings, roots] = await Promise.all([
      apiFetch<SiteSettingRow[]>("/site-settings"),
      fetchCategoryTree(),
    ]);
    const map = siteSettingsToMap(settings);
    return {
      title: settingValue(
        map,
        CATALOG_HUB_SETTING_KEYS.title as PublicSiteSettingKey,
        DEFAULT_HUB.title,
      ),
      subtitle: settingValue(
        map,
        CATALOG_HUB_SETTING_KEYS.subtitle as PublicSiteSettingKey,
        DEFAULT_HUB.subtitle,
      ),
      sections: roots.map(hubSectionFromRoot),
    };
  } catch {
    return DEFAULT_HUB;
  }
}
