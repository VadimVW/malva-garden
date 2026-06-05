"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ProductReviewsTab } from "@/components/store/product/ProductReviewsTab";
import type { ProductReviewsSummary } from "@/lib/product-reviews";

type TabId = "desc" | "care" | "reviews";

type Props = {
  description: string | null;
  careDescription: string | null;
  productSlug: string;
  preview?: boolean;
  initialReviewSummary?: ProductReviewsSummary;
};

function reviewsTabLabel(count: number): string {
  if (count <= 0) return "Відгуки";
  return `Відгуки (${count})`;
}

export function ProductFigmaTabs({
  description,
  careDescription,
  productSlug,
  preview = false,
  initialReviewSummary,
}: Props) {
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const initialTab: TabId =
    tabFromUrl === "reviews" || tabFromUrl === "care" || tabFromUrl === "desc"
      ? tabFromUrl
      : "desc";

  const [tab, setTab] = useState<TabId>(initialTab);
  const reviewCount = initialReviewSummary?.count ?? 0;

  useEffect(() => {
    if (
      tabFromUrl === "reviews" ||
      tabFromUrl === "care" ||
      tabFromUrl === "desc"
    ) {
      setTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  const descBody =
    description?.trim() ||
    "Опис товару з’явиться після заповнення в адмін-панелі.";
  const careBody =
    careDescription?.trim() ||
    "Рекомендації з догляду з’являться після заповнення в адмін-панелі.";

  function tabButton(id: TabId, label: string) {
    const active = tab === id;
    return (
      <button
        type="button"
        onClick={() => setTab(id)}
        className={`mg-tab-btn pb-3 ${active ? "text-black" : "text-[#9C9A9A]"}`}
      >
        <span
          className={`inline-block border-b-2 pb-3 transition-colors ${
            active ? "border-[#5C97A8]" : "border-transparent"
          }`}
        >
          {label}
        </span>
      </button>
    );
  }

  return (
    <section className="rounded-2xl bg-white p-6 shadow-[0px_6px_20px_rgba(0,0,0,0.08)]">
      <div className="relative flex flex-wrap gap-x-8 gap-y-1 border-b border-[#E0E0E0] text-[15px] font-bold">
        {tabButton("desc", "Опис")}
        {tabButton("care", "Догляд")}
        {tabButton("reviews", reviewsTabLabel(reviewCount))}
      </div>
      <div key={tab} className="mg-tab-panel mt-5 text-[14px] leading-relaxed text-[#333333]">
        {tab === "desc" ? (
          <div className="space-y-4 whitespace-pre-wrap">{descBody}</div>
        ) : tab === "care" ? (
          <div className="space-y-4 whitespace-pre-wrap">{careBody}</div>
        ) : preview ? (
          <p className="text-[#666]">
            Відгуки недоступні в режимі прев’ю.
          </p>
        ) : (
          <ProductReviewsTab
            productSlug={productSlug}
            initialSummary={initialReviewSummary}
          />
        )}
      </div>
    </section>
  );
}
