import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateSiteSettingDto } from "./dto/site-setting.dto";

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  findAllPublic() {
    return this.prisma.siteSetting.findMany({
      orderBy: { key: "asc" },
      select: { key: true, value: true },
    });
  }

  findAllAdmin() {
    return this.prisma.siteSetting.findMany({
      orderBy: { key: "asc" },
    });
  }

  async findOneAdmin(key: string) {
    const row = await this.prisma.siteSetting.findUnique({ where: { key } });
    if (!row) throw new NotFoundException("Налаштування не знайдено");
    return row;
  }

  async upsert(key: string, value: string) {
    return this.prisma.siteSetting.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
  }

  async create(dto: CreateSiteSettingDto) {
    const exists = await this.prisma.siteSetting.findUnique({
      where: { key: dto.key },
    });
    if (exists) throw new BadRequestException("Ключ вже існує");
    return this.prisma.siteSetting.create({
      data: { key: dto.key, value: dto.value },
    });
  }

  async remove(key: string) {
    const cur = await this.prisma.siteSetting.findUnique({ where: { key } });
    if (!cur) throw new NotFoundException("Налаштування не знайдено");
    await this.prisma.siteSetting.delete({ where: { key } });
    return { ok: true };
  }
}
