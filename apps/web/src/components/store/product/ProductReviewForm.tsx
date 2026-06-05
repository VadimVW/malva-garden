"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ProductReviewStarsInput } from "@/components/store/product/ProductReviewStars";
import {
  submitProductReview,
  type ReviewEligibility,
} from "@/lib/product-reviews";
import { CustomerApiError } from "@/lib/customer-api";
import { useCustomerAuth } from "@/providers/CustomerAuthProvider";

const BODY_MIN = 20;
const BODY_MAX = 2000;

type Props = {
  productSlug: string;
  eligibility: ReviewEligibility | null;
  eligibilityLoading: boolean;
  onSubmitted: () => void;
  onReloadEligibility: () => void;
};

function eligibilityMessage(eligibility: ReviewEligibility | null): string | null {
  if (!eligibility) return null;
  switch (eligibility.reason) {
    case "EMAIL_NOT_VERIFIED":
      return "Підтвердіть email у профілі, щоб залишити відгук.";
    case "NO_PURCHASE":
      return "Відгук можна залишити після отримання замовлення з цим товаром.";
    case "PENDING":
      return "Ваш відгук на модерації. Він з’явиться після перевірки.";
    case "ALREADY_PUBLISHED":
      return "Ви вже залишили відгук на цей товар.";
    case "RESUBMIT":
      return "Попередній відгук не опубліковано. Ви можете надіслати новий.";
    default:
      return null;
  }
}

export function ProductReviewForm({
  productSlug,
  eligibility,
  eligibilityLoading,
  onSubmitted,
  onReloadEligibility,
}: Props) {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useCustomerAuth();
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const returnUrl = `/product/${productSlug}?tab=reviews`;

  if (authLoading || eligibilityLoading) {
    return (
      <p className="text-[14px] text-[#9C9A9A]">Перевіряємо можливість залишити відгук…</p>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="rounded-xl border border-[#E8E8E8] bg-[#FAFAFA] p-4">
        <p className="text-[14px] text-[#333]">
          Увійдіть, щоб залишити відгук про товар після покупки.
        </p>
        <Link
          href={`/account/login?returnUrl=${encodeURIComponent(returnUrl)}`}
          className="mg-btn-primary mt-3 inline-flex rounded-lg bg-[#5C97A8] px-4 py-2 text-[14px] font-semibold text-white"
        >
          Увійти
        </Link>
      </div>
    );
  }

  if (!eligibility?.canReview) {
    const message = eligibilityMessage(eligibility);
    if (!message) return null;
    return (
      <div className="rounded-xl border border-[#E8E8E8] bg-[#FAFAFA] p-4">
        <p className="text-[14px] text-[#333]">{message}</p>
        {eligibility?.reason === "EMAIL_NOT_VERIFIED" ? (
          <Link
            href="/account/profile"
            className="mt-2 inline-block text-[14px] font-semibold text-[#5C97A8] underline"
          >
            Перейти до профілю
          </Link>
        ) : null}
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const trimmed = body.trim();
    if (trimmed.length < BODY_MIN) {
      setError(`Текст відгуку — щонайменше ${BODY_MIN} символів.`);
      return;
    }
    setSubmitting(true);
    try {
      await submitProductReview(productSlug, { rating, body: trimmed });
      setBody("");
      setRating(5);
      onSubmitted();
      onReloadEligibility();
      router.refresh();
    } catch (err) {
      setError(
        err instanceof CustomerApiError
          ? err.message
          : "Не вдалося надіслати відгук. Спробуйте пізніше.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-[#E8E8E8] bg-[#FAFAFA] p-4"
    >
      <p className="text-[15px] font-bold text-black">Залишити відгук</p>
      {eligibility?.reason === "RESUBMIT" ? (
        <p className="mt-1 text-[13px] text-[#666]">
          Попередній відгук не опубліковано. Надішліть новий текст.
        </p>
      ) : null}
      <div className="mt-3">
        <p className="mb-1 text-[13px] font-medium text-[#333]">Ваша оцінка</p>
        <ProductReviewStarsInput
          value={rating}
          onChange={setRating}
          disabled={submitting}
        />
      </div>
      <label className="mt-4 block">
        <span className="mb-1 block text-[13px] font-medium text-[#333]">
          Відгук
        </span>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          maxLength={BODY_MAX}
          disabled={submitting}
          placeholder="Поділіться враженнями про товар…"
          className="w-full resize-y rounded-lg border border-[#D8D8D8] bg-white px-3 py-2 text-[14px] text-[#333] outline-none focus:border-[#5C97A8]"
        />
        <span className="mt-1 block text-right text-[12px] text-[#9C9A9A]">
          {body.trim().length}/{BODY_MAX}
        </span>
      </label>
      {error ? (
        <p className="mt-2 text-[13px] text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={submitting}
        className="mg-btn-primary mt-3 rounded-lg bg-[#5C97A8] px-5 py-2.5 text-[14px] font-semibold text-white disabled:opacity-60"
      >
        {submitting ? "Надсилання…" : "Надіслати відгук"}
      </button>
    </form>
  );
}
