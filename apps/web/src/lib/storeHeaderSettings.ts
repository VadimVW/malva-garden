import { cache } from "react";
import {
  parseOrderMinimumAmount,
  PUBLIC_SITE_SETTING_DEFAULTS,
  phoneToTelHref,
  type PublicSiteSettingKey,
} from "@malva/site-settings";
import {
  fetchSiteSettings,
  getSiteSetting,
  siteSettingsToMap,
  type SiteSettingRow,
} from "@/lib/siteSettings";

export { phoneToTelHref };

export const STORE_HEADER_SETTING_KEYS = {
  phone: "header_phone",
  viberUrl: "header_viber_url",
  telegramUrl: "header_telegram_url",
  youtubeUrl: "footer_youtube_url",
  tiktokUrl: "footer_tiktok_url",
  facebookUrl: "footer_facebook_url",
  instagramUrl: "footer_instagram_url",
  copyright: "footer_copyright",
  orderMinimumAmount: "order_minimum_amount",
} as const;

export type StoreHeaderSettings = {
  phone: string;
  viberUrl: string;
  telegramUrl: string;
  youtubeUrl: string;
  tiktokUrl: string;
  facebookUrl: string;
  instagramUrl: string;
  copyright: string;
  orderMinimumAmount: number;
};

export const STORE_HEADER_DEFAULTS: StoreHeaderSettings = {
  phone: PUBLIC_SITE_SETTING_DEFAULTS.header_phone,
  viberUrl: PUBLIC_SITE_SETTING_DEFAULTS.header_viber_url,
  telegramUrl: PUBLIC_SITE_SETTING_DEFAULTS.header_telegram_url,
  youtubeUrl: PUBLIC_SITE_SETTING_DEFAULTS.footer_youtube_url,
  tiktokUrl: PUBLIC_SITE_SETTING_DEFAULTS.footer_tiktok_url,
  facebookUrl: PUBLIC_SITE_SETTING_DEFAULTS.footer_facebook_url,
  instagramUrl: PUBLIC_SITE_SETTING_DEFAULTS.footer_instagram_url,
  copyright: PUBLIC_SITE_SETTING_DEFAULTS.footer_copyright,
  orderMinimumAmount: parseOrderMinimumAmount(
    PUBLIC_SITE_SETTING_DEFAULTS.order_minimum_amount,
  ),
};

function pick(
  map: Map<string, string>,
  key: PublicSiteSettingKey,
  fallback: string,
): string {
  return getSiteSetting(map, key, fallback);
}

export function buildStoreHeaderSettings(
  rows: SiteSettingRow[],
): StoreHeaderSettings {
  const map = siteSettingsToMap(rows);
  return {
    phone: pick(map, "header_phone", STORE_HEADER_DEFAULTS.phone),
    viberUrl: pick(map, "header_viber_url", STORE_HEADER_DEFAULTS.viberUrl),
    telegramUrl: pick(
      map,
      "header_telegram_url",
      STORE_HEADER_DEFAULTS.telegramUrl,
    ),
    youtubeUrl: pick(
      map,
      "footer_youtube_url",
      STORE_HEADER_DEFAULTS.youtubeUrl,
    ),
    tiktokUrl: pick(map, "footer_tiktok_url", STORE_HEADER_DEFAULTS.tiktokUrl),
    facebookUrl: pick(
      map,
      "footer_facebook_url",
      STORE_HEADER_DEFAULTS.facebookUrl,
    ),
    instagramUrl: pick(
      map,
      "footer_instagram_url",
      STORE_HEADER_DEFAULTS.instagramUrl,
    ),
    copyright: pick(map, "footer_copyright", STORE_HEADER_DEFAULTS.copyright),
    orderMinimumAmount: parseOrderMinimumAmount(
      pick(
        map,
        "order_minimum_amount",
        String(STORE_HEADER_DEFAULTS.orderMinimumAmount),
      ),
    ),
  };
}

async function loadStoreHeaderSettingsUncached(): Promise<StoreHeaderSettings> {
  try {
    const rows = await fetchSiteSettings();
    return buildStoreHeaderSettings(rows);
  } catch {
    return STORE_HEADER_DEFAULTS;
  }
}

/** Дедуплікація в межах одного SSR-запиту; дані з ISR fetch у `fetchSiteSettings`. */
export const loadStoreHeaderSettings = cache(loadStoreHeaderSettingsUncached);
