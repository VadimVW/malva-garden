import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, ProductStatus } from "@prisma/client";
import { parseHomeLeaderProductIds } from "../settings/public-site-settings";
import { PrismaService } from "../prisma/prisma.service";
import { moneyToString } from "../common/money";
import { CreateProductImageDto } from "./dto/create-product-image.dto";
import { CreateProductDto } from "./dto/create-product.dto";
import { ProductsQueryDto } from "./dto/products-query.dto";
import { UpdateProductImageDto } from "./dto/update-product-image.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import {
  normalizeProductSearchQuery,
  SEARCH_FUZZY_MIN_QUERY_LENGTH,
  SEARCH_TRGM_SIMILARITY_THRESHOLD,
} from "./product-search.constants";

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  private mapPublicProduct(
    p: Prisma.ProductGetPayload<{ include: { images: true; category: true } }>,
  ) {
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: moneyToString(p.price),
      stockQuantity: p.stockQuantity,
      category: p.category
        ? { id: p.category.id, name: p.category.name, slug: p.category.slug }
        : null,
      images: p.images
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((img) => ({
          id: img.id,
          imageUrl: img.imageUrl,
          altText: img.altText,
          sortOrder: img.sortOrder,
          isMain: img.isMain,
        })),
    };
  }

  /** Усі нащадки (включно з коренем) для фільтра товарів за slug батьківської категорії. */
  private async categoryIdsInSubtreeBySlug(slug: string): Promise<string[] | null> {
    const root = await this.prisma.category.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!root) return null;
    const ids = new Set<string>([root.id]);
    let frontier = [root.id];
    while (frontier.length) {
      const children = await this.prisma.category.findMany({
        where: { parentId: { in: frontier } },
        select: { id: true },
      });
      frontier = [];
      for (const c of children) {
        if (!ids.has(c.id)) {
          ids.add(c.id);
          frontier.push(c.id);
        }
      }
    }
    return [...ids];
  }

  private buildPublicListBaseAnd(
    query: ProductsQueryDto,
    categoryIds: string[] | null,
  ): Prisma.ProductWhereInput[] {
    return [
      query.minPrice !== undefined
        ? { price: { gte: query.minPrice } }
        : {},
      query.maxPrice !== undefined
        ? { price: { lte: query.maxPrice } }
        : {},
      query.inStock === true ? { stockQuantity: { gt: 0 } } : {},
      categoryIds ? { category: { id: { in: categoryIds } } } : {},
    ].filter((x) => Object.keys(x).length > 0);
  }

  /** pg_trgm fallback, якщо підрядковий пошук нічого не знайшов (§7.18). */
  private async findFuzzyProductIdsByName(
    q: string,
    query: ProductsQueryDto,
    categoryIds: string[] | null,
    limit: number,
    skip: number,
  ): Promise<{ ids: string[]; total: number }> {
    const parts: Prisma.Sql[] = [
      Prisma.sql`p.status = CAST(${ProductStatus.ACTIVE} AS "ProductStatus")`,
      Prisma.sql`similarity(p.name, ${q}) > ${SEARCH_TRGM_SIMILARITY_THRESHOLD}`,
    ];
    if (categoryIds?.length) {
      parts.push(
        Prisma.sql`p."categoryId" IN (${Prisma.join(
          categoryIds.map((id) => Prisma.sql`${id}`),
        )})`,
      );
    }
    if (query.minPrice !== undefined) {
      parts.push(Prisma.sql`p.price >= ${query.minPrice}`);
    }
    if (query.maxPrice !== undefined) {
      parts.push(Prisma.sql`p.price <= ${query.maxPrice}`);
    }
    if (query.inStock === true) {
      parts.push(Prisma.sql`p."stockQuantity" > 0`);
    }

    const whereSql = Prisma.join(parts, " AND ");

    let orderSql: Prisma.Sql;
    if (query.sort === "price_asc") {
      orderSql = Prisma.sql`similarity(p.name, ${q}) DESC, p.price ASC`;
    } else if (query.sort === "price_desc") {
      orderSql = Prisma.sql`similarity(p.name, ${q}) DESC, p.price DESC`;
    } else {
      orderSql = Prisma.sql`similarity(p.name, ${q}) DESC, p."createdAt" DESC`;
    }

    const [countRows, idRows] = await Promise.all([
      this.prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*)::bigint AS count
        FROM "Product" p
        WHERE ${whereSql}
      `,
      this.prisma.$queryRaw<[{ id: string }]>`
        SELECT p.id
        FROM "Product" p
        WHERE ${whereSql}
        ORDER BY ${orderSql}
        LIMIT ${limit} OFFSET ${skip}
      `,
    ]);

    return {
      total: Number(countRows[0]?.count ?? 0),
      ids: idRows.map((r) => r.id),
    };
  }

  private async loadPublicProductsByIds(ids: string[]) {
    if (!ids.length) return [];
    const rows = await this.prisma.product.findMany({
      where: { id: { in: ids } },
      include: { images: true, category: true },
    });
    const byId = new Map(rows.map((p) => [p.id, p]));
    return ids
      .map((id) => byId.get(id))
      .filter((p): p is NonNullable<typeof p> => Boolean(p));
  }

  async findManyPublic(query: ProductsQueryDto) {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 24, 48);
    const skip = (page - 1) * limit;
    const searchQ = query.q ? normalizeProductSearchQuery(query.q) : "";

    let categoryIds: string[] | null = null;
    if (query.categorySlug) {
      categoryIds = await this.categoryIdsInSubtreeBySlug(query.categorySlug);
      if (!categoryIds?.length) {
        return {
          items: [],
          page,
          limit,
          total: 0,
          totalPages: 0,
        };
      }
    }

    const baseAnd = this.buildPublicListBaseAnd(query, categoryIds);

    if (searchQ) {
      const substringWhere: Prisma.ProductWhereInput = {
        status: ProductStatus.ACTIVE,
        AND: [
          ...baseAnd,
          {
            name: {
              contains: searchQ,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        ],
      };

      let orderBy: Prisma.ProductOrderByWithRelationInput = {
        createdAt: "desc",
      };
      if (query.sort === "price_asc") orderBy = { price: "asc" };
      if (query.sort === "price_desc") orderBy = { price: "desc" };

      let total = await this.prisma.product.count({ where: substringWhere });
      let items = await this.prisma.product.findMany({
        where: substringWhere,
        orderBy,
        skip,
        take: limit,
        include: { images: true, category: true },
      });

      if (
        total === 0 &&
        searchQ.length >= SEARCH_FUZZY_MIN_QUERY_LENGTH
      ) {
        const fuzzy = await this.findFuzzyProductIdsByName(
          searchQ,
          query,
          categoryIds,
          limit,
          skip,
        );
        total = fuzzy.total;
        items = await this.loadPublicProductsByIds(fuzzy.ids);
      }

      return {
        items: items.map((p) => this.mapPublicProduct(p)),
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 0,
      };
    }

    const where: Prisma.ProductWhereInput = {
      status: ProductStatus.ACTIVE,
      AND: baseAnd.length ? baseAnd : undefined,
    };

    let orderBy: Prisma.ProductOrderByWithRelationInput = {
      createdAt: "desc",
    };
    if (query.sort === "price_asc") orderBy = { price: "asc" };
    if (query.sort === "price_desc") orderBy = { price: "desc" };

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: { images: true, category: true },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      items: items.map((p) => this.mapPublicProduct(p)),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 0,
    };
  }

  async findManyPublicByIds(ids: string[]) {
    const unique = [...new Set(ids.map((id) => id.trim()).filter(Boolean))];
    if (!unique.length) return [];

    const rows = await this.prisma.product.findMany({
      where: { id: { in: unique }, status: ProductStatus.ACTIVE },
      include: { images: true, category: true },
    });
    const byId = new Map(rows.map((p) => [p.id, p]));
    return unique
      .map((id) => byId.get(id))
      .filter((p): p is NonNullable<typeof p> => Boolean(p))
      .map((p) => this.mapPublicProduct(p));
  }

  async findHomeLeaders(limit = 6) {
    const row = await this.prisma.siteSetting.findUnique({
      where: { key: "home_leader_product_ids" },
      select: { value: true },
    });
    const curatedIds = parseHomeLeaderProductIds(row?.value);
    if (curatedIds.length) {
      const items = await this.findManyPublicByIds(curatedIds);
      if (items.length) return { items };
    }

    const fallback = await this.findManyPublic({
      page: 1,
      limit,
      sort: "new",
    });
    return { items: fallback.items };
  }

  async findBySlugPublic(slug: string) {
    const p = await this.prisma.product.findFirst({
      where: { slug, status: ProductStatus.ACTIVE },
      include: { images: true, category: true },
    });
    if (!p) throw new NotFoundException("Товар не знайдено");
    return {
      ...this.mapPublicProduct(p),
      description: p.description,
      careDescription: p.careDescription,
      seoTitle: p.seoTitle,
      seoDescription: p.seoDescription,
    };
  }

  findAllAdmin() {
    return this.prisma.product.findMany({
      orderBy: { updatedAt: "desc" },
      include: { images: true, category: true },
    });
  }

  async create(dto: CreateProductDto) {
    const exists = await this.prisma.product.findUnique({
      where: { slug: dto.slug },
    });
    if (exists) throw new BadRequestException("Slug вже зайнятий");
    return this.prisma.product.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        careDescription: dto.careDescription,
        price: dto.price,
        stockQuantity: dto.stockQuantity,
        status: dto.status,
        categoryId: dto.categoryId,
        seoTitle: dto.seoTitle,
        seoDescription: dto.seoDescription,
        images: dto.images?.length
          ? {
              create: dto.images.map((img, i) => ({
                imageUrl: img.imageUrl,
                altText: img.altText,
                sortOrder: img.sortOrder ?? i,
                isMain: img.isMain ?? i === 0,
              })),
            }
          : undefined,
      },
      include: { images: true, category: true },
    });
  }

  async update(id: string, dto: UpdateProductDto) {
    const current = await this.prisma.product.findUnique({ where: { id } });
    if (!current) throw new NotFoundException("Товар не знайдено");
    if (dto.slug && dto.slug !== current.slug) {
      const clash = await this.prisma.product.findUnique({
        where: { slug: dto.slug },
      });
      if (clash) throw new BadRequestException("Slug вже зайнятий");
    }
    return this.prisma.product.update({
      where: { id },
      data: {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        careDescription: dto.careDescription,
        price: dto.price,
        stockQuantity: dto.stockQuantity,
        status: dto.status,
        categoryId: dto.categoryId,
        seoTitle: dto.seoTitle,
        seoDescription: dto.seoDescription,
      },
      include: { images: true, category: true },
    });
  }

  async remove(id: string) {
    await this.prisma.product.update({
      where: { id },
      data: { status: ProductStatus.HIDDEN },
    });
    return { ok: true };
  }

  private async ensureProduct(id: string) {
    const p = await this.prisma.product.findUnique({ where: { id } });
    if (!p) throw new NotFoundException("Товар не знайдено");
    return p;
  }

  private async normalizeMainImagesTx(
    tx: Prisma.TransactionClient,
    productId: string,
  ) {
    const images = await tx.productImage.findMany({
      where: { productId },
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    });
    if (!images.length) return;
    const mains = images.filter((i) => i.isMain);
    if (mains.length === 1) return;
    await tx.productImage.updateMany({
      where: { productId },
      data: { isMain: false },
    });
    const pick =
      mains.length > 1
        ? mains
            .slice()
            .sort(
              (a, b) =>
                a.sortOrder - b.sortOrder || a.id.localeCompare(b.id),
            )[0]
        : images[0];
    await tx.productImage.update({
      where: { id: pick.id },
      data: { isMain: true },
    });
  }

  async addImage(productId: string, dto: CreateProductImageDto) {
    await this.ensureProduct(productId);
    const count = await this.prisma.productImage.count({
      where: { productId },
    });
    const sortOrder = dto.sortOrder ?? count;
    const isMain = dto.isMain ?? count === 0;

    return this.prisma.$transaction(async (tx) => {
      if (isMain) {
        await tx.productImage.updateMany({
          where: { productId },
          data: { isMain: false },
        });
      }
      const created = await tx.productImage.create({
        data: {
          productId,
          imageUrl: dto.imageUrl,
          altText: dto.altText,
          sortOrder,
          isMain,
        },
      });
      await this.normalizeMainImagesTx(tx, productId);
      return tx.productImage.findUniqueOrThrow({ where: { id: created.id } });
    });
  }

  async updateImage(
    productId: string,
    imageId: string,
    dto: UpdateProductImageDto,
  ) {
    await this.ensureProduct(productId);
    const img = await this.prisma.productImage.findFirst({
      where: { id: imageId, productId },
    });
    if (!img) throw new NotFoundException("Зображення не знайдено");

    return this.prisma.$transaction(async (tx) => {
      if (dto.isMain === true) {
        await tx.productImage.updateMany({
          where: { productId },
          data: { isMain: false },
        });
      }
      await tx.productImage.update({
        where: { id: imageId },
        data: {
          imageUrl: dto.imageUrl,
          altText: dto.altText,
          sortOrder: dto.sortOrder,
          isMain: dto.isMain,
        },
      });
      await this.normalizeMainImagesTx(tx, productId);
      return tx.productImage.findUniqueOrThrow({ where: { id: imageId } });
    });
  }

  async removeImage(productId: string, imageId: string) {
    await this.ensureProduct(productId);
    const img = await this.prisma.productImage.findFirst({
      where: { id: imageId, productId },
    });
    if (!img) throw new NotFoundException("Зображення не знайдено");

    return this.prisma.$transaction(async (tx) => {
      await tx.productImage.delete({ where: { id: imageId } });
      await this.normalizeMainImagesTx(tx, productId);
      return { ok: true };
    });
  }
}
