import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateContentPageDto } from "./dto/create-content-page.dto";
import { UpdateContentPageDto } from "./dto/update-content-page.dto";

@Injectable()
export class PagesService {
  constructor(private readonly prisma: PrismaService) {}

  async findPublicBySlug(slug: string) {
    const page = await this.prisma.contentPage.findUnique({ where: { slug } });
    if (!page) throw new NotFoundException("Сторінку не знайдено");
    return {
      title: page.title,
      slug: page.slug,
      content: page.content,
      seoTitle: page.seoTitle,
      seoDescription: page.seoDescription,
      updatedAt: page.updatedAt,
    };
  }

  findAllAdmin() {
    return this.prisma.contentPage.findMany({
      orderBy: { slug: "asc" },
    });
  }

  async create(dto: CreateContentPageDto) {
    const exists = await this.prisma.contentPage.findUnique({
      where: { slug: dto.slug },
    });
    if (exists) throw new BadRequestException("Slug вже зайнятий");
    return this.prisma.contentPage.create({
      data: {
        title: dto.title,
        slug: dto.slug,
        content: dto.content,
        seoTitle: dto.seoTitle,
        seoDescription: dto.seoDescription,
      },
    });
  }

  async removeBySlug(slug: string) {
    const cur = await this.prisma.contentPage.findUnique({ where: { slug } });
    if (!cur) throw new NotFoundException("Сторінку не знайдено");
    await this.prisma.contentPage.delete({ where: { slug } });
    return { ok: true };
  }

  async updateBySlug(slug: string, dto: UpdateContentPageDto) {
    const cur = await this.prisma.contentPage.findUnique({ where: { slug } });
    if (!cur) throw new NotFoundException("Сторінку не знайдено");
    return this.prisma.contentPage.update({
      where: { slug },
      data: dto,
    });
  }
}
