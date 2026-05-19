import type { Metadata } from "next";
import MalvaGardenCatalogHubDesktop from "@/components/figma/MalvaGardenCatalogHubDesktop";
import { catalogHubMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = catalogHubMetadata;

export default function CatalogHubPage() {
  return (
    <div className="min-h-screen w-full bg-[#F5F5F5]">
      <MalvaGardenCatalogHubDesktop />
    </div>
  );
}
