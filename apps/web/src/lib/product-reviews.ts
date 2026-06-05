import { apiFetch } from "@/lib/api";
import { customerFetch } from "@/lib/customer-api";

export type ProductReviewPublic = {
  id: string;
  rating: number;
  body: string;
  authorDisplayName: string;
  verifiedPurchase: boolean;
  publishedAt: string;
};

export type ProductReviewsSummary = {
  averageRating: number | null;
  count: number;
};

export type ProductReviewsPage = {
  items: ProductReviewPublic[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  summary: ProductReviewsSummary;
};

export type ReviewEligibilityReason =
  | "EMAIL_NOT_VERIFIED"
  | "NO_PURCHASE"
  | "PENDING"
  | "ALREADY_PUBLISHED"
  | "RESUBMIT";

export type ReviewEligibility = {
  canReview: boolean;
  reason: ReviewEligibilityReason | null;
  verifiedPurchase: boolean;
  existingReview: {
    id: string;
    status: string;
    rating: number;
    body: string;
    createdAt: string;
    updatedAt: string;
  } | null;
};

export async function fetchProductReviews(
  slug: string,
  page = 1,
  limit = 10,
): Promise<ProductReviewsPage> {
  return apiFetch<ProductReviewsPage>(
    `/products/${encodeURIComponent(slug)}/reviews?page=${page}&limit=${limit}`,
    { revalidateSeconds: 60 },
  );
}

export async function fetchReviewEligibility(
  slug: string,
): Promise<ReviewEligibility> {
  return customerFetch<ReviewEligibility>(
    `/products/${encodeURIComponent(slug)}/reviews/eligibility`,
  );
}

export async function submitProductReview(
  slug: string,
  input: { rating: number; body: string },
): Promise<{ id: string; status: string; message: string }> {
  return customerFetch(`/products/${encodeURIComponent(slug)}/reviews`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}
