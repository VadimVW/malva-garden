import { Module } from "@nestjs/common";
import { ProductsModule } from "../products/products.module";
import { AdminCategoriesController } from "./admin-categories.controller";
import { PublicCategoriesController } from "./public-categories.controller";
import { CategoriesService } from "./categories.service";

@Module({
  imports: [ProductsModule],
  controllers: [PublicCategoriesController, AdminCategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
