import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { JwtAdminAuthGuard } from "../auth/jwt-admin.guard";
import { CreateContentPageDto } from "./dto/create-content-page.dto";
import { UpdateContentPageDto } from "./dto/update-content-page.dto";
import { PagesService } from "./pages.service";

@Controller("admin/pages")
@UseGuards(JwtAdminAuthGuard)
export class AdminPagesController {
  constructor(private readonly pages: PagesService) {}

  @Get()
  list() {
    return this.pages.findAllAdmin();
  }

  @Post()
  create(@Body() dto: CreateContentPageDto) {
    return this.pages.create(dto);
  }

  @Patch(":slug")
  update(@Param("slug") slug: string, @Body() dto: UpdateContentPageDto) {
    return this.pages.updateBySlug(slug, dto);
  }

  @Delete(":slug")
  remove(@Param("slug") slug: string) {
    return this.pages.removeBySlug(slug);
  }
}
