import { JsonLd } from "@/components/seo/JsonLd";
import { absoluteUrl } from "@/lib/seo/site";

type ProductJsonLdProps = {
  name: string;
  description: string | null;
  slug: string;
  price: string;
  stockQuantity: number;
  imageUrls: string[];
};

export function ProductJsonLd({
  name,
  description,
  slug,
  price,
  stockQuantity,
  imageUrls,
}: ProductJsonLdProps) {
  const url = absoluteUrl(`/product/${slug}`);
  const images = imageUrls.length
    ? imageUrls.map((u) => (u.startsWith("http") ? u : absoluteUrl(u)))
    : undefined;

  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description: description ?? undefined,
    image: images,
    url,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "UAH",
      price,
      availability:
        stockQuantity > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };

  return <JsonLd data={data} />;
}
