"use client";

import Link from "next/link";
import { useFooterContentPages } from "@/providers/FooterContentPagesProvider";

type Props = {
  className?: string;
  titleClassName?: string;
};

/** Блок «Клієнтам» у footer — посилання з `ContentPage` (§7.23.4). */
export function FigmaStoreFooterCustomerLinks({
  className,
  titleClassName = "font-bold",
}: Props) {
  const pages = useFooterContentPages();
  if (pages.length === 0) return null;

  return (
    <div className={className}>
      <p className={titleClassName}>Клієнтам:</p>
      {pages.map((page) => (
        <Link
          key={page.slug}
          href={`/pages/${page.slug}`}
          className="hover:underline"
        >
          {page.title}
        </Link>
      ))}
    </div>
  );
}
