import { InputHTMLAttributes, forwardRef } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  hint?: string;
};

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { label, error, hint, className = "", id, ...props },
  ref,
) {
  const inputId = id ?? props.name;
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={`w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition focus:border-admin-primary focus:outline-none focus:ring-2 focus:ring-admin-primary/20 ${
          error ? "border-red-400" : "border-admin-border"
        } ${className}`}
        {...props}
      />
      {hint && !error && <p className="text-xs text-admin-muted">{hint}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
});
