import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ProductsService } from "../products/products.service";
import { ProductsQueryDto } from "../products/dto/products-query.dto";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

type CategoryRow = {
  id: string;
  parentId: string | null;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  sortOrder: number;
};

@Injectable()
export class CategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly products: ProductsService,
  ) {}

  async getTree() {
    const rows = await this.prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
    return { items: this.buildTree(rows) };
  }

  private buildTree(rows: CategoryRow[]) {
    const byParent = new Map<string | null, CategoryRow[]>();
    for (const r of rows) {
      const key = r.parentId;
      if (!byParent.has(key)) byParent.set(key, []);
      byParent.get(key)!.push(r);
    }
    const walk = (parentId: string | null): unknown[] => {
      const list = byParent.get(parentId) ?? [];
      return list.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        imageUrl: c.imageUrl,
        children: walk(c.id),
      }));
    };
    return walk(null);
  }

  async getBySlug(slug: string) {
    const cat = await this.prisma.category.findUnique({ where: { slug } });
    if (!cat) throw new NotFoundException("Категорія не знайдена");
    const breadcrumbs = await this.getBreadcrumbs(cat.id);
    return { category: cat, breadcrumbs };
  }

  private async getBreadcrumbs(id: string) {
    const chain: { id: string; name: string; slug: string }[] = [];
    let current = await this.prisma.category.findUnique({ where: { id } });
    while (current) {
      chain.unshift({
        id: current.id,
        name: current.name,
        slug: current.slug,
      });
      if (!current.parentId) break;
      current = await this.prisma.category.findUnique({
        where: { id: current.parentId },
      });
    }
    return chain;
  }

  getProductsByCategorySlug(slug: string, query: ProductsQueryDto) {
    return this.products.findManyPublic({
      ...query,
      categorySlug: slug,
    });
  }

  findAllAdmin() {
    return this.prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
  }

  async create(dto: CreateCategoryDto) {
    const exists = await this.prisma.category.findUnique({
      where: { slug: dto.slug },
    });
    if (exists) throw new BadRequestException("Slug вже зайнятий");
    if (dto.parentId) {
      const parent = await this.prisma.category.findUnique({
        where: { id: dto.parentId },
      });
      if (!parent) throw new BadRequestException("Батьківська категорія не знайдена");
    }
    return this.prisma.category.create({ data: dto });
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const cur = await this.prisma.category.findUnique({ where: { id } });
    if (!cur) throw new NotFoundException("Категорія не знайдена");
    if (dto.slug && dto.slug !== cur.slug) {
      const clash = await this.prisma.category.findUnique({
        where: { slug: dto.slug },
      });
      if (clash) throw new BadRequestException("Slug вже зайнятий");
    }
    if (dto.parentId === id) {
      throw new BadRequestException("Категорія не може бути батьком сама собі");
    }
    if (dto.parentId) {
      const parent = await this.prisma.category.findUnique({
        where: { id: dto.parentId },
      });
      if (!parent) throw new BadRequestException("Батьківська категорія не знайдена");
      if (await this.wouldCreateCategoryCycle(id, dto.parentId)) {
        throw new BadRequestException("Некоректний батьківський зв'язок (цикл у дереві)");
      }
    }
    return this.prisma.category.update({ where: { id }, data: dto });
  }

  private async wouldCreateCategoryCycle(
    categoryId: string,
    newParentId: string,
  ): Promise<boolean> {
    let cur = await this.prisma.category.findUnique({
      where: { id: newParentId },
      select: { id: true, parentId: true },
    });
    while (cur) {
      if (cur.id === categoryId) return true;
      if (!cur.parentId) break;
      cur = await this.prisma.category.findUnique({
        where: { id: cur.parentId },
        select: { id: true, parentId: true },
      });
    }
    return false;
  }

  async remove(id: string) {
    const children = await this.prisma.category.count({
      where: { parentId: id },
    });
    if (children) {
      throw new BadRequestException("Спочатку видаліть підкатегорії");
    }
    const products = await this.prisma.product.count({
      where: { categoryId: id },
    });
    if (products) {
      throw new BadRequestException("У категорії є товари");
    }
    await this.prisma.category.delete({ where: { id } });
    return { ok: true };
  }
}
