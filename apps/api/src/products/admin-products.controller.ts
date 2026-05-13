import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ProductStatus } from "@prisma/client";
import { CurrentAdmin } from "../common/decorators/current-admin.decorator";
import type { AdminUserPayload } from "../common/decorators/current-admin.decorator";
import { JwtAdminAuthGuard } from "../auth/jwt-admin.guard";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { ProductsService } from "./products.service";

@Controller("admin/products")
@UseGuards(JwtAdminAuthGuard)
export class AdminProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get()
  list() {
    return this.products.findAllAdmin();
  }

  @Post()
  create(@Body() dto: CreateProductDto, @CurrentAdmin() _admin: AdminUserPayload) {
    return this.products.create(dto);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() dto: UpdateProductDto,
    @CurrentAdmin() _admin: AdminUserPayload,
  ) {
    return this.products.update(id, dto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.products.remove(id);
  }
}
