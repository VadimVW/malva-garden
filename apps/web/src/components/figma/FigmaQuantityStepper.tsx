type Props = {
  value: number;
  min?: number;
  max?: number;
  onDecrease: () => void;
  onIncrease: () => void;
  disabled?: boolean;
};

export function FigmaQuantityStepper({
  value,
  min = 1,
  max,
  onDecrease,
  onIncrease,
  disabled,
}: Props) {
  const atMin = value <= min;
  const atMax = max !== undefined && value >= max;

  return (
    <div className="inline-flex items-center rounded-lg bg-[#E8E8E8] p-1">
      <button
        type="button"
        onClick={onDecrease}
        disabled={disabled || atMin}
        className="inline-flex size-9 items-center justify-center rounded-md text-lg font-medium text-[#5C97A8] transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Менше"
      >
        −
      </button>
      <span className="min-w-[2rem] text-center text-[15px] font-semibold text-black">
        {value}
      </span>
      <button
        type="button"
        onClick={onIncrease}
        disabled={disabled || atMax}
        className="inline-flex size-9 items-center justify-center rounded-md text-lg font-medium text-[#5C97A8] transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Більше"
      >
        +
      </button>
    </div>
  );
}
