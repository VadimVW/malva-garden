import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/cart",
        "/checkout",
        "/order/",
        "/search",
        "/figma-preview/",
      ],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
