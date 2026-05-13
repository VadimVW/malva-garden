import { Body, Controller, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { JwtAdminAuthGuard } from "../auth/jwt-admin.guard";
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

  @Patch(":slug")
  update(@Param("slug") slug: string, @Body() dto: UpdateContentPageDto) {
    return this.pages.updateBySlug(slug, dto);
  }
}
