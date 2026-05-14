import { Module } from "@nestjs/common";
import { AdminProductImagesController } from "./admin-product-images.controller";
import { AdminProductsController } from "./admin-products.controller";
import { PublicProductsController } from "./public-products.controller";
import { ProductsService } from "./products.service";

@Module({
  controllers: [
    PublicProductsController,
    AdminProductsController,
    AdminProductImagesController,
  ],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
