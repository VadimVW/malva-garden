import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
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

  async updateBySlug(slug: string, dto: UpdateContentPageDto) {
    const cur = await this.prisma.contentPage.findUnique({ where: { slug } });
    if (!cur) throw new NotFoundException("Сторінку не знайдено");
    return this.prisma.contentPage.update({
      where: { slug },
      data: dto,
    });
  }
}
