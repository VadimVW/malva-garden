"use client";

import { useCallback, useEffect, useState } from "react";
import { ProductReviewForm } from "@/components/store/product/ProductReviewForm";
import { ProductReviewStars } from "@/components/store/product/ProductReviewStars";
import {
  fetchProductReviews,
  fetchReviewEligibility,
  type ProductReviewPublic,
  type ProductReviewsSummary,
  type ReviewEligibility,
} from "@/lib/product-reviews";
import { useCustomerAuth } from "@/providers/CustomerAuthProvider";

function formatReviewDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("uk-UA", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

type Props = {
  productSlug: string;
  initialSummary?: ProductReviewsSummary;
};

export function ProductReviewsTab({ productSlug, initialSummary }: Props) {
  const { isAuthenticated } = useCustomerAuth();
  const [summary, setSummary] = useState<ProductReviewsSummary>(
    initialSummary ?? { averageRating: null, count: 0 },
  );
  const [items, setItems] = useState<ProductReviewPublic[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [eligibility, setEligibility] = useState<ReviewEligibility | null>(null);
  const [eligibilityLoading, setEligibilityLoading] = useState(false);

  const loadReviews = useCallback(
    async (pageToLoad: number, append: boolean) => {
      if (append) setLoadingMore(true);
      else setLoading(true);
      setLoadError(null);
      try {
        const data = await fetchProductReviews(productSlug, pageToLoad, 10);
        setSummary(data.summary);
        setPage(data.page);
        setTotalPages(data.totalPages);
        setItems((prev) => (append ? [...prev, ...data.items] : data.items));
      } catch {
        setLoadError("Не вдалося завантажити відгуки.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [productSlug],
  );

  const loadEligibility = useCallback(async () => {
    if (!isAuthenticated) {
      setEligibility(null);
      return;
    }
    setEligibilityLoading(true);
    try {
      const data = await fetchReviewEligibility(productSlug);
      setEligibility(data);
    } catch {
      setEligibility(null);
    } finally {
      setEligibilityLoading(false);
    }
  }, [isAuthenticated, productSlug]);

  useEffect(() => {
    void loadReviews(1, false);
  }, [loadReviews]);

  useEffect(() => {
    void loadEligibility();
  }, [loadEligibility]);

  return (
    <div className="space-y-6">
      {summary.count > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          <ProductReviewStars
            rating={summary.averageRating ?? 0}
            size="md"
          />
          <span className="text-[14px] text-[#333]">
            <span className="font-semibold text-black">
              {summary.averageRating?.toFixed(1)}
            </span>
            {" · "}
            {summary.count}{" "}
            {summary.count === 1
              ? "відгук"
              : summary.count < 5
                ? "відгуки"
                : "відгуків"}
          </span>
        </div>
      ) : null}

      <ProductReviewForm
        productSlug={productSlug}
        eligibility={eligibility}
        eligibilityLoading={eligibilityLoading}
        onSubmitted={() => void loadReviews(1, false)}
        onReloadEligibility={() => void loadEligibility()}
      />

      {loading ? (
        <p className="text-[14px] text-[#9C9A9A]">Завантаження відгуків…</p>
      ) : null}
      {loadError ? (
        <p className="text-[14px] text-red-600">{loadError}</p>
      ) : null}

      {!loading && !loadError && items.length === 0 ? (
        <p className="text-[14px] text-[#666]">
          Поки немає відгуків. Будьте першим!
        </p>
      ) : null}

      {items.length > 0 ? (
        <ul className="space-y-5">
          {items.map((review) => (
            <li
              key={review.id}
              className="border-t border-[#EEEEEE] pt-5 first:border-t-0 first:pt-0"
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="text-[14px] font-semibold text-black">
                  {review.authorDisplayName}
                </span>
                {review.verifiedPurchase ? (
                  <span className="rounded-full bg-[#E8F3F5] px-2 py-0.5 text-[11px] font-medium text-[#5C97A8]">
                    Перевірена покупка
                  </span>
                ) : null}
                <ProductReviewStars rating={review.rating} size="sm" />
                <span className="text-[12px] text-[#9C9A9A]">
                  {formatReviewDate(review.publishedAt)}
                </span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-[14px] leading-relaxed text-[#333]">
                {review.body}
              </p>
            </li>
          ))}
        </ul>
      ) : null}

      {page < totalPages ? (
        <button
          type="button"
          disabled={loadingMore}
          onClick={() => void loadReviews(page + 1, true)}
          className="text-[14px] font-semibold text-[#5C97A8] underline disabled:opacity-60"
        >
          {loadingMore ? "Завантаження…" : "Показати ще"}
        </button>
      ) : null}
    </div>
  );
}
