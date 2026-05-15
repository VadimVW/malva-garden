import Link from "next/link";
import { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  action,
  backHref,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  backHref?: string;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        {backHref && (
          <Link
            href={backHref}
            className="mb-2 inline-block text-sm text-admin-muted hover:text-gray-900"
          >
            ← Назад
          </Link>
        )}
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-admin-muted">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
