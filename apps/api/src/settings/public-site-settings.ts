/**
 * Public SiteSetting keys — single source for API whitelist, web, admin, seed.
 */

export const PUBLIC_SITE_SETTING_KEYS = [
  "catalog_hub_title",
  "catalog_hub_subtitle",
  "header_phone",
  "header_contact_email",
  "header_viber_url",
  "header_telegram_url",
  "footer_youtube_url",
  "footer_tiktok_url",
  "footer_facebook_url",
  "footer_instagram_url",
  "footer_copyright",
  "order_minimum_amount",
  "home_leader_product_ids",
] as const;

export const HOME_LEADER_SLOT_COUNT = 6;

export type PublicSiteSettingKey = (typeof PUBLIC_SITE_SETTING_KEYS)[number];

export const PUBLIC_SITE_SETTING_DEFAULTS: Record<
  PublicSiteSettingKey,
  string
> = {
  catalog_hub_title: "Оберіть розділ каталогу",
  catalog_hub_subtitle: "Оберіть категорію, щоб переглянути товари.",
  header_phone: "+380 67 258 98 28",
  header_contact_email: "info@malva-garden.com",
  header_viber_url: "viber://chat?number=380672589828",
  header_telegram_url: "https://t.me/malvagarden",
  footer_youtube_url: "https://www.youtube.com/",
  footer_tiktok_url: "https://www.tiktok.com/",
  footer_facebook_url: "https://www.facebook.com/",
  footer_instagram_url: "https://www.instagram.com/",
  footer_copyright: "",
  order_minimum_amount: "200",
  home_leader_product_ids: "[]",
};

export type PublicSiteSettingFieldType =
  | "text"
  | "url"
  | "phone"
  | "email"
  | "number";

export type PublicSiteSettingFieldMeta = {
  key: PublicSiteSettingKey;
  label: string;
  hint?: string;
  type: PublicSiteSettingFieldType;
  section: "catalog_hub" | "header" | "footer" | "checkout";
};

export const PUBLIC_SITE_SETTING_FIELDS: PublicSiteSettingFieldMeta[] = [
  {
    key: "catalog_hub_title",
    label: "Заголовок hub `/catalog`",
    type: "text",
    section: "catalog_hub",
  },
  {
    key: "catalog_hub_subtitle",
    label: "Підзаголовок hub `/catalog`",
    type: "text",
    section: "catalog_hub",
  },
  {
    key: "header_phone",
    label: "Телефон",
    hint: "Шапка та footer; при зміні можна оновити Viber (viber://)",
    type: "phone",
    section: "header",
  },
  {
    key: "header_contact_email",
    label: "Email контактів",
    hint: "Footer та сторінка контактів; вхідна пошта — Cloudflare Email Routing (docs/EMAIL_CLOUDFLARE_ROUTING.md)",
    type: "email",
    section: "header",
  },
  {
    key: "header_viber_url",
    label: "Viber (посилання)",
    type: "url",
    section: "header",
  },
  {
    key: "header_telegram_url",
    label: "Telegram (посилання)",
    type: "url",
    section: "header",
  },
  {
    key: "footer_youtube_url",
    label: "YouTube",
    type: "url",
    section: "footer",
  },
  {
    key: "footer_tiktok_url",
    label: "TikTok",
    type: "url",
    section: "footer",
  },
  {
    key: "footer_facebook_url",
    label: "Facebook",
    type: "url",
    section: "footer",
  },
  {
    key: "footer_instagram_url",
    label: "Instagram",
    type: "url",
    section: "footer",
  },
  {
    key: "footer_copyright",
    label: "Copyright (рядок під footer, опційно)",
    type: "text",
    section: "footer",
  },
  {
    key: "order_minimum_amount",
    label: "Мінімальна сума замовлення (грн)",
    hint: "Перевірка на кошику, checkout і при створенні замовлення",
    type: "number",
    section: "checkout",
  },
];

/** Парсить мін. суму з SiteSetting; некоректне значення → дефолт 200. */
/** Парсить до 6 унікальних product id для блоку «Лідери продажу». */
export function parseHomeLeaderProductIds(
  value: string | undefined | null,
): string[] {
  if (value == null || !String(value).trim()) return [];
  try {
    const parsed: unknown = JSON.parse(String(value));
    if (!Array.isArray(parsed)) return [];
    const seen = new Set<string>();
    const out: string[] = [];
    for (const item of parsed) {
      if (typeof item !== "string") continue;
      const id = item.trim();
      if (!id || seen.has(id)) continue;
      seen.add(id);
      out.push(id);
      if (out.length >= HOME_LEADER_SLOT_COUNT) break;
    }
    return out;
  } catch {
    return [];
  }
}

export function serializeHomeLeaderProductIds(
  slots: readonly string[],
): string {
  const ids: string[] = [];
  const seen = new Set<string>();
  for (const raw of slots) {
    const id = raw.trim();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    ids.push(id);
    if (ids.length >= HOME_LEADER_SLOT_COUNT) break;
  }
  return JSON.stringify(ids);
}

export function homeLeaderSlotsFromValue(
  value: string | undefined | null,
): string[] {
  const ids = parseHomeLeaderProductIds(value);
  const slots = [...ids];
  while (slots.length < HOME_LEADER_SLOT_COUNT) slots.push("");
  return slots.slice(0, HOME_LEADER_SLOT_COUNT);
}

export function parseOrderMinimumAmount(value: string | undefined | null): number {
  const fallback = Number(PUBLIC_SITE_SETTING_DEFAULTS.order_minimum_amount) || 200;
  if (value == null || !String(value).trim()) return fallback;
  const n = Math.floor(
    Number(String(value).trim().replace(/\s/g, "").replace(",", ".")),
  );
  if (!Number.isFinite(n) || n < 0) return fallback;
  return n;
}

export function isPublicSiteSettingKey(
  key: string,
): key is PublicSiteSettingKey {
  return (PUBLIC_SITE_SETTING_KEYS as readonly string[]).includes(key);
}

export function phoneDigits(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function phoneToViberUrl(phone: string): string {
  const digits = phoneDigits(phone);
  return digits ? `viber://chat?number=${digits}` : "";
}

export function phoneToTelHref(phone: string): string {
  const digits = phoneDigits(phone);
  return digits ? `tel:+${digits.replace(/^\+?/, "")}` : "";
}
