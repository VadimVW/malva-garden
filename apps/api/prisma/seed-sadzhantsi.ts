import { readFileSync } from "fs";
import { join } from "path";
import { PrismaClient, ProductStatus } from "@prisma/client";
import { seedProductImageUrl } from "./seed-products-data";

export type SadzhantsiCategoryJson = {
  name: string;
  slug: string;
  parent: string | null;
};

export type SadzhantsiProductImageJson = {
  image_url: string;
  alt_text?: string;
  is_main?: boolean;
  sort_order?: number;
};

export type SadzhantsiProductJson = {
  name: string;
  slug: string;
  category: SadzhantsiCategoryJson;
  price_uah: number;
  stock: number;
  status: string;
  description: string;
  care: string;
  seo_title: string;
  seo_description: string;
  /** Реальні URL з адмінки (експорт у JSON); інакше — placehold.co */
  images?: SadzhantsiProductImageJson[];
};

export type SadzhantsiCatalogJson = {
  meta: { total: number; status_default?: string };
  products: SadzhantsiProductJson[];
};

const DATA_PATH = join(__dirname, "data", "mock_sadzhantsi_products.json");

const PARENT_NAME_TO_SLUG: Record<string, string> = {
  Квіти: "kvity",
  "Декоративні кущі": "dekoratyvni-kushi",
};

const PARENT_SORT: Record<string, number> = {
  kvity: 1,
  "dekoratyvni-kushi": 10,
  "dekoratyvni-travy": 11,
};

function loadSadzhantsiCatalog(): SadzhantsiCatalogJson {
  const raw = readFileSync(DATA_PATH, "utf-8");
  return JSON.parse(raw) as SadzhantsiCatalogJson;
}

function mapProductStatus(status: string): ProductStatus {
  const s = status.trim().toLowerCase();
  if (s === "активний" || s === "active") return ProductStatus.ACTIVE;
  return ProductStatus.HIDDEN;
}

function productImagesFromJson(row: SadzhantsiProductJson) {
  if (row.images?.length) {
    return row.images.map((img, i) => ({
      imageUrl: img.image_url,
      altText: img.alt_text ?? row.name,
      isMain: img.is_main ?? i === 0,
      sortOrder: img.sort_order ?? i,
    }));
  }
  return [
    {
      imageUrl: seedProductImageUrl(row.slug),
      altText: row.name,
      isMain: true,
      sortOrder: 0,
    },
  ];
}

/** Видаляє всі замовлення, кошики та товари (зображення — каскадом). */
export async function clearOrdersAndProducts(prisma: PrismaClient) {
  const [orders, carts, products] = await prisma.$transaction([
    prisma.order.deleteMany(),
    prisma.cart.deleteMany(),
    prisma.product.deleteMany(),
  ]);
  return {
    orders: orders.count,
    carts: carts.count,
    products: products.count,
  };
}

async function ensureCategoryTree(
  prisma: PrismaClient,
  products: SadzhantsiProductJson[],
): Promise<Map<string, string>> {
  const categoryIdBySlug = new Map<string, string>();

  const parentsNeeded = new Map<string, { name: string; slug: string }>();
  const childrenNeeded = new Map<
    string,
    { name: string; slug: string; parentSlug: string | null }
  >();

  for (const p of products) {
    const c = p.category;
    if (c.parent) {
      const parentSlug = PARENT_NAME_TO_SLUG[c.parent];
      if (!parentSlug) {
        throw new Error(`Unknown parent category label: ${c.parent}`);
      }
      parentsNeeded.set(parentSlug, { name: c.parent, slug: parentSlug });
      childrenNeeded.set(c.slug, {
        name: c.name,
        slug: c.slug,
        parentSlug,
      });
    } else {
      childrenNeeded.set(c.slug, {
        name: c.name,
        slug: c.slug,
        parentSlug: null,
      });
    }
  }

  for (const [slug, meta] of parentsNeeded) {
    const row = await prisma.category.upsert({
      where: { slug },
      update: { name: meta.name, parentId: null },
      create: {
        name: meta.name,
        slug,
        parentId: null,
        sortOrder: PARENT_SORT[slug] ?? 50,
      },
    });
    categoryIdBySlug.set(slug, row.id);
  }

  let childSort = 0;
  for (const [, meta] of childrenNeeded) {
    const parentId = meta.parentSlug
      ? categoryIdBySlug.get(meta.parentSlug) ??
        (await prisma.category.findUnique({ where: { slug: meta.parentSlug } }))?.id
      : null;

    if (meta.parentSlug && !parentId) {
      throw new Error(`Parent category not found: ${meta.parentSlug}`);
    }

    const row = await prisma.category.upsert({
      where: { slug: meta.slug },
      update: {
        name: meta.name,
        parentId: parentId ?? null,
      },
      create: {
        name: meta.name,
        slug: meta.slug,
        parentId: parentId ?? null,
        sortOrder: childSort++,
      },
    });
    categoryIdBySlug.set(meta.slug, row.id);
  }

  return categoryIdBySlug;
}

/** Заповнює каталог товарами з `mock_sadzhantsi_products.json`. */
export async function seedSadzhantsiProducts(prisma: PrismaClient) {
  const catalog = loadSadzhantsiCatalog();
  const categoryIdBySlug = await ensureCategoryTree(prisma, catalog.products);

  let created = 0;
  for (const row of catalog.products) {
    const categoryId = categoryIdBySlug.get(row.category.slug);
    if (!categoryId) {
      throw new Error(`Category id missing for slug ${row.category.slug}`);
    }

    await prisma.product.create({
      data: {
        name: row.name,
        slug: row.slug,
        price: row.price_uah,
        stockQuantity: row.stock,
        status: mapProductStatus(row.status),
        categoryId,
        description: row.description,
        careDescription: row.care,
        seoTitle: row.seo_title,
        seoDescription: row.seo_description,
        images: {
          create: productImagesFromJson(row),
        },
      },
    });
    created++;
    if (created % 40 === 0) {
      console.log(`  … ${created}/${catalog.products.length} products`);
    }
  }

  return { total: catalog.products.length, metaTotal: catalog.meta.total };
}
