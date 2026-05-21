import type { Metadata } from "next";
import type { ReactNode } from "react";
import { NOINDEX_ROBOTS } from "@/lib/seo/metadata";

export const metadata: Metadata = {
  robots: NOINDEX_ROBOTS,
  title: "Пошук",
};

export default function SearchLayout({ children }: { children: ReactNode }) {
  return children;
}
