import { JsonLd } from "@/components/seo/JsonLd";
import { absoluteUrl } from "@/lib/seo/site";

type ProductJsonLdProps = {
  name: string;
  description: string | null;
  slug: string;
  price: string;
  stockQuantity: number;
  imageUrls: string[];
  reviewSummary?: { averageRating: number | null; count: number };
  sampleReviews?: { authorDisplayName: string; rating: number; body: string }[];
};

export function ProductJsonLd({
  name,
  description,
  slug,
  price,
  stockQuantity,
  imageUrls,
  reviewSummary,
  sampleReviews,
}: ProductJsonLdProps) {
  const url = absoluteUrl(`/product/${slug}`);
  const images = imageUrls.length
    ? imageUrls.map((u) => (u.startsWith("http") ? u : absoluteUrl(u)))
    : undefined;

  const reviewCount = reviewSummary?.count ?? 0;
  const avgRating = reviewSummary?.averageRating;

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
    ...(reviewCount > 0 && avgRating != null
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: avgRating,
            reviewCount,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
    ...(sampleReviews && sampleReviews.length > 0
      ? {
          review: sampleReviews.map((r) => ({
            "@type": "Review",
            author: { "@type": "Person", name: r.authorDisplayName },
            reviewRating: {
              "@type": "Rating",
              ratingValue: r.rating,
              bestRating: 5,
              worstRating: 1,
            },
            reviewBody: r.body,
          })),
        }
      : {}),
  };

  return <JsonLd data={data} />;
}
