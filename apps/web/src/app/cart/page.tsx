import type { Metadata } from "next";
import { MalvaGardenCartDesktop } from "@/components/store/MalvaGardenCartDesktop";
import { buildPageMetadata, NOINDEX_ROBOTS } from "@/lib/seo/metadata";

export const metadata: Metadata = {
  ...buildPageMetadata({
    title: "Кошик",
    path: "/cart",
    noIndex: true,
  }),
  robots: NOINDEX_ROBOTS,
};

export default function CartPage() {
  return <MalvaGardenCartDesktop />;
}
