import { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-admin-border bg-admin-surface shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}
