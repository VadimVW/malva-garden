import sanitizeHtml from "sanitize-html";

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
    img: ["src", "alt", "title", "width", "height"],
    a: ["href", "name", "target", "rel"],
    th: ["colspan", "rowspan"],
    td: ["colspan", "rowspan"],
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
