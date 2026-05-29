import type { Metadata } from "next";
import MalvaGardenCatalogHubDesktop from "@/components/figma/MalvaGardenCatalogHubDesktop";
import { loadCatalogHubContent } from "@/lib/catalogHubSettings";
import { catalogHubMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = catalogHubMetadata;

export default async function CatalogHubPage() {
  const hub = await loadCatalogHubContent();

  return (
    <div className="min-h-screen w-full bg-[#F5F5F5]">
      <MalvaGardenCatalogHubDesktop {...hub} />
    </div>
  );
}
