import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, ProductStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { moneyToString } from "../common/money";
import { CreateProductDto } from "./dto/create-product.dto";
import { ProductsQueryDto } from "./dto/products-query.dto";
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
              name: { contains: query.q, mode: "insensitive" },
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
}
