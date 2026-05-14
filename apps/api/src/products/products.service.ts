import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, ProductStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { moneyToString } from "../common/money";
import { CreateProductImageDto } from "./dto/create-product-image.dto";
import { CreateProductDto } from "./dto/create-product.dto";
import { ProductsQueryDto } from "./dto/products-query.dto";
import { UpdateProductImageDto } from "./dto/update-product-image.dto";
import { UpdateProductDto } from "./dto/update-product.dto";

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

  async findManyPublic(query: ProductsQueryDto) {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 24, 48);
    const skip = (page - 1) * limit;

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

    const where: Prisma.ProductWhereInput = {
      status: ProductStatus.ACTIVE,
      category: categoryIds
        ? { id: { in: categoryIds } }
        : undefined,
      AND: [
        query.minPrice !== undefined
          ? { price: { gte: query.minPrice } }
          : {},
        query.maxPrice !== undefined
          ? { price: { lte: query.maxPrice } }
          : {},
        query.inStock === true ? { stockQuantity: { gt: 0 } } : {},
        query.q
          ? {
              name: { contains: query.q, mode: Prisma.QueryMode.insensitive },
            }
          : {},
      ].filter((x) => Object.keys(x).length > 0),
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
      totalPages: Math.ceil(total / limit),
    };
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
