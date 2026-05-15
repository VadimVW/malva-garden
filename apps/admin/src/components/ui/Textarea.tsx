import { TextareaHTMLAttributes, forwardRef } from "react";

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
  hint?: string;
};

export const Textarea = forwardRef<HTMLTextAreaElement, Props>(function Textarea(
  { label, error, hint, className = "", id, ...props },
  ref,
) {
  const areaId = id ?? props.name;
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={areaId} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={areaId}
        className={`w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:border-admin-primary focus:outline-none focus:ring-2 focus:ring-admin-primary/20 ${
          error ? "border-red-400" : "border-admin-border"
        } ${className}`}
        {...props}
      />
      {hint && !error && <p className="text-xs text-admin-muted">{hint}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
});
