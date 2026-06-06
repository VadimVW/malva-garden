import type { Metadata } from "next";
import MalvaGardenHomeDesktop from "@/components/store/MalvaGardenHomeDesktop";
import MalvaGardenHomeMobile from "@/components/store/mobile/MalvaGardenHomeMobile";
import { loadCatalogHubContent } from "@/lib/catalogHubSettings";
import { loadHomeLeaderProducts } from "@/lib/homeLeaderProducts";
import { homeMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = homeMetadata;

export default async function HomePage() {
  const [leaders, hub] = await Promise.all([
    loadHomeLeaderProducts(),
    loadCatalogHubContent(),
  ]);

  return (
    <>
      <MalvaGardenHomeMobile
        leaderProducts={leaders}
        hubSections={hub.sections}
      />
      <div className="hidden min-h-screen w-full bg-[#F5F5F5] lg:block">
        <MalvaGardenHomeDesktop leaderProducts={leaders} />
      </div>
    </>
  );
}
