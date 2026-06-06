import sanitizeHtml from "sanitize-html";

const CSS_COLOR = /^#(?:[0-9a-fA-F]{3,8})$/;
const CSS_LENGTH = /^(?:0|\d+(?:\.\d+)?(?:px|em|rem|%))$/;
const CSS_LENGTH_AUTO = /^(?:0|\d+(?:\.\d+)?(?:px|em|rem|%)|auto)$/;
const CSS_LENGTH_LIST = /^(?:(?:0|\d+(?:\.\d+)?(?:px|em|rem|%)|auto)(?:\s+(?:0|\d+(?:\.\d+)?(?:px|em|rem|%)|auto))*)$/;
const CSS_FONT_SIZE = /^\d+(?:\.\d+)?(?:px|em|rem|%)$/;
const CSS_LINE_HEIGHT = /^(?:\d+(?:\.\d+)?|\d+(?:\.\d+)?(?:px|em|rem))$/;
const CSS_FONT_WEIGHT = /^(?:normal|bold|[1-9]00|400|600|700)$/;
const CSS_BORDER = /^\d+px\s+solid\s+#(?:[0-9a-fA-F]{3,8})$/;
const CSS_FONT_FAMILY = /^[a-zA-Z0-9,\s"']+$/;
const CSS_GAP = /^\d+(?:\.\d+)?px$/;

/** Safe inline styles for admin-authored content pages (layout/typography only). */
const CONTENT_PAGE_ALLOWED_STYLES: Record<string, RegExp[]> = {
  display: [/^(?:block|inline|inline-block|flex)$/],
  "flex-wrap": [/^(?:wrap|nowrap)$/],
  "justify-content": [/^(?:center|flex-start|flex-end|space-between)$/],
  gap: [CSS_GAP],
  "max-width": [CSS_LENGTH],
  width: [CSS_LENGTH],
  height: [CSS_LENGTH],
  margin: [CSS_LENGTH_LIST],
  "margin-top": [CSS_LENGTH_AUTO],
  "margin-bottom": [CSS_LENGTH],
  "margin-left": [CSS_LENGTH_AUTO],
  "margin-right": [CSS_LENGTH_AUTO],
  padding: [CSS_LENGTH_LIST],
  "text-align": [/^(?:left|right|center|justify)$/],
  "font-family": [CSS_FONT_FAMILY],
  "font-size": [CSS_FONT_SIZE],
  "font-weight": [CSS_FONT_WEIGHT],
  "line-height": [CSS_LINE_HEIGHT],
  color: [CSS_COLOR],
  background: [CSS_COLOR],
  "background-color": [CSS_COLOR],
  border: [CSS_BORDER],
  "box-sizing": [/^(?:border-box|content-box)$/],
  "text-transform": [/^(?:uppercase|lowercase|capitalize|none)$/],
};

const CONTENT_PAGE_SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    ...(sanitizeHtml.defaults.allowedTags ?? []),
    "img",
    "h1",
    "h2",
    "h3",
    "h4",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
  ],
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    "*": [
      ...new Set([
        ...(sanitizeHtml.defaults.allowedAttributes?.["*"] ?? []),
        "style",
      ]),
    ],
    img: ["src", "alt", "title", "width", "height", "style"],
    a: ["href", "name", "target", "rel", "style"],
    th: ["colspan", "rowspan", "style"],
    td: ["colspan", "rowspan", "style"],
  },
  allowedStyles: {
    "*": CONTENT_PAGE_ALLOWED_STYLES,
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesByTag: {
    img: ["http", "https"],
  },
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", {
      rel: "noopener noreferrer",
      target: "_blank",
    }),
  },
};

/** Strip scripts/event handlers from admin HTML before store/render. */
export function sanitizeContentHtml(html: string): string {
  return sanitizeHtml(html, CONTENT_PAGE_SANITIZE_OPTIONS);
}
