import { cache } from "react";
import {
  fetchSiteSettings,
  getSiteSetting,
  siteSettingsToMap,
  type SiteSettingRow,
} from "@/lib/siteSettings";

export const STORE_HEADER_SETTING_KEYS = {
  phone: "header_phone",
  whatsappUrl: "header_whatsapp_url",
  telegramUrl: "header_telegram_url",
} as const;

export type StoreHeaderSettings = {
  phone: string;
  whatsappUrl: string;
  telegramUrl: string;
};

export const STORE_HEADER_DEFAULTS: StoreHeaderSettings = {
  phone: "+380 67 258 98 28",
  whatsappUrl: "https://wa.me/380672589828",
  telegramUrl: "https://t.me/malvagarden",
};

export function buildStoreHeaderSettings(
  rows: SiteSettingRow[],
): StoreHeaderSettings {
  const map = siteSettingsToMap(rows);
  return {
    phone: getSiteSetting(
      map,
      STORE_HEADER_SETTING_KEYS.phone,
      STORE_HEADER_DEFAULTS.phone,
    ),
    whatsappUrl: getSiteSetting(
      map,
      STORE_HEADER_SETTING_KEYS.whatsappUrl,
      STORE_HEADER_DEFAULTS.whatsappUrl,
    ),
    telegramUrl: getSiteSetting(
      map,
      STORE_HEADER_SETTING_KEYS.telegramUrl,
      STORE_HEADER_DEFAULTS.telegramUrl,
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

export function phoneToTelHref(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits ? `tel:+${digits.replace(/^\+?/, "")}` : "";
}
