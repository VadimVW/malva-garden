import type { Metadata } from "next";
import { MalvaGardenCheckoutDesktop } from "@/components/store/MalvaGardenCheckoutDesktop";
import { buildPageMetadata, NOINDEX_ROBOTS } from "@/lib/seo/metadata";

export const metadata: Metadata = {
  ...buildPageMetadata({
    title: "Оформлення замовлення",
    path: "/checkout",
    noIndex: true,
  }),
  robots: NOINDEX_ROBOTS,
};

export default function CheckoutPage() {
  return <MalvaGardenCheckoutDesktop />;
}
