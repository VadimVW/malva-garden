/**
 * Merge image URLs from DB into mock_sadzhantsi_products.json (by product slug).
 * Run: node prisma/scripts/export-image-urls-to-json.mjs
 */
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, "..", "data", "mock_sadzhantsi_products.json");

const prisma = new PrismaClient();

function isPlaceholder(url) {
  return url.includes("placehold.co");
}

async function main() {
  const catalog = JSON.parse(readFileSync(DATA_PATH, "utf-8"));
  const dbProducts = await prisma.product.findMany({
    include: { images: { orderBy: [{ isMain: "desc" }, { sortOrder: "asc" }] } },
  });
  const imagesBySlug = new Map();
  for (const p of dbProducts) {
    const real = p.images.filter((i) => !isPlaceholder(i.imageUrl));
    if (real.length) {
      imagesBySlug.set(
        p.slug,
        real.map((i) => ({
          image_url: i.imageUrl,
          alt_text: i.altText ?? p.name,
          is_main: i.isMain,
          sort_order: i.sortOrder,
        })),
      );
    }
  }

  let merged = 0;
  for (const product of catalog.products) {
    const imgs = imagesBySlug.get(product.slug);
    if (imgs?.length) {
      product.images = imgs;
      merged++;
    }
  }

  catalog.meta.images_from_db = merged;
  catalog.meta.images_updated_at = new Date().toISOString().slice(0, 10);

  writeFileSync(DATA_PATH, JSON.stringify(catalog, null, 2) + "\n", "utf-8");
  console.log(`Merged images for ${merged} products into ${DATA_PATH}`);
  console.log(`DB had ${imagesBySlug.size} products with non-placeholder images`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
