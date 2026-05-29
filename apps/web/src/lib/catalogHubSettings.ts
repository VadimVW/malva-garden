import { apiFetch } from "@/lib/api";

/** Ключі `SiteSetting` для hub `/catalog` (§7.16). */
export const CATALOG_HUB_SETTING_KEYS = {
  title: "catalog_hub_title",
  subtitle: "catalog_hub_subtitle",
  kvity: {
    title: "catalog_section_kvity_title",
    subtitle: "catalog_section_kvity_subtitle",
    image: "catalog_section_kvity_image",
  },
  kushi: {
    title: "catalog_section_kushi_title",
    subtitle: "catalog_section_kushi_subtitle",
    image: "catalog_section_kushi_image",
  },
  travy: {
    title: "catalog_section_travy_title",
    subtitle: "catalog_section_travy_subtitle",
    image: "catalog_section_travy_image",
  },
} as const;

export type CatalogHubSectionContent = {
  href: string;
  title: string;
  description: string;
  imageSrc: string;
  imageClassName: string;
};

export type CatalogHubContent = {
  title: string;
  subtitle: string;
  sections: CatalogHubSectionContent[];
};

const DEFAULT_SECTIONS: CatalogHubSectionContent[] = [
  {
    href: "/catalog/kvity",
    title: "Квіти",
    description:
      "Однорічні, багаторічні, хризантеми та інші культури для саду й балкону",
    imageSrc: "/images/figma/catalog/hero-kvity.png",
    imageClassName: "object-cover object-[center_22%]",
  },
  {
    href: "/catalog/dekoratyvni-kushi",
    title: "Декоративні кущі",
    description: "Гортензії, троянди, клематиси та інші кущі для ландшафту",
    imageSrc: "/images/figma/home/banner-bg.png",
    imageClassName: "object-cover object-center",
  },
  {
    href: "/catalog/dekoratyvni-travy",
    title: "Декоративні трави",
    description: "Трави та злаки для клумб, бордюрів і природних композицій",
    imageSrc: "/images/figma/home/banner-bg.png",
    imageClassName: "object-cover object-[center_60%]",
  },
];

const DEFAULT_HUB: CatalogHubContent = {
  title: "Оберіть розділ каталогу",
  subtitle: "Оберіть категорію, щоб переглянути товари.",
  sections: DEFAULT_SECTIONS,
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

function mergeSection(
  map: Map<string, string>,
  defaults: CatalogHubSectionContent,
  keys: { title: string; subtitle: string; image: string },
): CatalogHubSectionContent {
  return {
    href: defaults.href,
    imageClassName: defaults.imageClassName,
    title: settingValue(map, keys.title, defaults.title),
    description: settingValue(map, keys.subtitle, defaults.description),
    imageSrc: settingValue(map, keys.image, defaults.imageSrc),
  };
}

export function buildCatalogHubContent(
  settings: SiteSettingRow[],
): CatalogHubContent {
  const map = new Map(settings.map((r) => [r.key, r.value]));
  const [kvity, kushi, travy] = DEFAULT_SECTIONS;

  return {
    title: settingValue(map, CATALOG_HUB_SETTING_KEYS.title, DEFAULT_HUB.title),
    subtitle: settingValue(
      map,
      CATALOG_HUB_SETTING_KEYS.subtitle,
      DEFAULT_HUB.subtitle,
    ),
    sections: [
      mergeSection(map, kvity, CATALOG_HUB_SETTING_KEYS.kvity),
      mergeSection(map, kushi, CATALOG_HUB_SETTING_KEYS.kushi),
      mergeSection(map, travy, CATALOG_HUB_SETTING_KEYS.travy),
    ],
  };
}

export async function loadCatalogHubContent(): Promise<CatalogHubContent> {
  try {
    const rows = await apiFetch<SiteSettingRow[]>("/site-settings");
    return buildCatalogHubContent(rows);
  } catch {
    return DEFAULT_HUB;
  }
}
