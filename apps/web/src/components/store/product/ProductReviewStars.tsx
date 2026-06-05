"use client";

type Props = {
  rating: number;
  max?: number;
  size?: "sm" | "md";
  className?: string;
};

export function ProductReviewStars({
  rating,
  max = 5,
  size = "md",
  className = "",
}: Props) {
  const sizeClass = size === "sm" ? "text-[14px]" : "text-[18px]";
  const rounded = Math.max(0, Math.min(max, Math.round(rating * 2) / 2));

  return (
    <span
      className={`inline-flex gap-0.5 text-[#5C97A8] ${sizeClass} ${className}`}
      aria-label={`Оцінка ${rating} з ${max}`}
    >
      {Array.from({ length: max }, (_, i) => {
        const filled = rounded >= i + 1;
        const half = !filled && rounded >= i + 0.5;
        return (
          <span key={i} className="leading-none">
            {filled ? "★" : half ? "⯨" : "☆"}
          </span>
        );
      })}
    </span>
  );
}

type InteractiveProps = {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
};

export function ProductReviewStarsInput({
  value,
  onChange,
  disabled = false,
}: InteractiveProps) {
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Оцінка">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onClick={() => onChange(star)}
          className={`text-[28px] leading-none transition ${
            star <= value ? "text-[#5C97A8]" : "text-[#D0D0D0]"
          } disabled:cursor-not-allowed disabled:opacity-50`}
          aria-label={`${star} зірок`}
          aria-checked={value === star}
          role="radio"
        >
          {star <= value ? "★" : "☆"}
        </button>
      ))}
    </div>
  );
}
