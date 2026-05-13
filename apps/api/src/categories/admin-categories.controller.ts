import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { JwtAdminAuthGuard } from "../auth/jwt-admin.guard";
import { CurrentAdmin } from "../common/decorators/current-admin.decorator";
import type { AdminUserPayload } from "../common/decorators/current-admin.decorator";
import { CategoriesService } from "./categories.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@Controller("admin/categories")
@UseGuards(JwtAdminAuthGuard)
export class AdminCategoriesController {
  constructor(private readonly categories: CategoriesService) {}

  @Get()
  list() {
    return this.categories.findAllAdmin();
  }

  @Post()
  create(@Body() dto: CreateCategoryDto, @CurrentAdmin() _a: AdminUserPayload) {
    return this.categories.create(dto);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateCategoryDto) {
    return this.categories.update(id, dto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.categories.remove(id);
  }
}
