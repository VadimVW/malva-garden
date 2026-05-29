import { apiFetch } from "@/lib/api";

export type SiteSettingRow = { key: string; value: string };

const PUBLIC_SETTINGS_REVALIDATE = 300;

export async function fetchSiteSettings(): Promise<SiteSettingRow[]> {
  return apiFetch<SiteSettingRow[]>("/site-settings", {
    revalidateSeconds: PUBLIC_SETTINGS_REVALIDATE,
  });
}

export function siteSettingsToMap(
  rows: SiteSettingRow[],
): Map<string, string> {
  return new Map(rows.map((r) => [r.key, r.value]));
}

export function getSiteSetting(
  map: Map<string, string>,
  key: string,
  fallback = "",
): string {
  const v = map.get(key)?.trim();
  return v && v.length > 0 ? v : fallback;
}
