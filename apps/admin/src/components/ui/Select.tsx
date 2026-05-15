import { SelectHTMLAttributes, forwardRef } from "react";

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
};

export const Select = forwardRef<HTMLSelectElement, Props>(function Select(
  { label, error, options, className = "", id, ...props },
  ref,
) {
  const selectId = id ?? props.name;
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        className={`w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:border-admin-primary focus:outline-none focus:ring-2 focus:ring-admin-primary/20 ${
          error ? "border-red-400" : "border-admin-border"
        } ${className}`}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
});
