import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

const variants: Record<Variant, string> = {
  primary:
    "bg-admin-primary text-white hover:bg-admin-primary-hover focus-visible:ring-admin-primary",
  secondary:
    "bg-white text-gray-800 border border-admin-border hover:bg-gray-50",
  danger:
    "bg-admin-danger text-white hover:bg-admin-danger-hover focus-visible:ring-admin-danger",
  ghost: "text-gray-700 hover:bg-gray-100",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
