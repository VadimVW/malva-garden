const DEFAULT_FIGMA_STORE_IMG = {
  logoMark: "/images/figma/home/logo-mark.png",
  headerTexture: "/images/figma/home/header-texture.png",
} as const;

const DEFAULT_FIGMA_SOCIAL_SVG = {
  youtube: "/images/figma/home/youtube.svg",
  tiktok: "/images/figma/home/tiktok.svg",
  facebook: "/images/figma/home/facebook.svg",
  instagram: "/images/figma/home/instagram.svg",
  telegram: "/images/figma/home/telegram.svg",
  viber: "/images/figma/home/viber.svg",
} as const;

export const FIGMA_STORE_IMG = DEFAULT_FIGMA_STORE_IMG;
export const FIGMA_SOCIAL_SVG = DEFAULT_FIGMA_SOCIAL_SVG;

/** Розмір `logo-mark.png` — оновлювати при заміні файлу. */
export const LOGO_MARK_INTRINSIC = { width: 1486, height: 1058 } as const;

/** Безпечний доступ під час завантаження chunk (уникає crash на `undefined.logoMark`). */
export function resolveFigmaStoreImg(): typeof DEFAULT_FIGMA_STORE_IMG {
  return FIGMA_STORE_IMG ?? DEFAULT_FIGMA_STORE_IMG;
}

export function resolveFigmaSocialSvg(): typeof DEFAULT_FIGMA_SOCIAL_SVG {
  return FIGMA_SOCIAL_SVG ?? DEFAULT_FIGMA_SOCIAL_SVG;
}
