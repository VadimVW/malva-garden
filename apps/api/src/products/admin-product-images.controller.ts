import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { JwtAdminAuthGuard } from "../auth/jwt-admin.guard";
import { CreateProductImageDto } from "./dto/create-product-image.dto";
import { UpdateProductImageDto } from "./dto/update-product-image.dto";
import { ProductsService } from "./products.service";

@Controller("admin/products/:productId/images")
@UseGuards(JwtAdminAuthGuard)
export class AdminProductImagesController {
  constructor(private readonly products: ProductsService) {}

  @Post()
  create(@Param("productId") productId: string, @Body() dto: CreateProductImageDto) {
    return this.products.addImage(productId, dto);
  }

  @Patch(":imageId")
  update(
    @Param("productId") productId: string,
    @Param("imageId") imageId: string,
    @Body() dto: UpdateProductImageDto,
  ) {
    return this.products.updateImage(productId, imageId, dto);
  }

  @Delete(":imageId")
  remove(
    @Param("productId") productId: string,
    @Param("imageId") imageId: string,
  ) {
    return this.products.removeImage(productId, imageId);
  }
}
