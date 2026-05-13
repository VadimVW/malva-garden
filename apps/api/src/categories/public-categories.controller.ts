import { Controller, Get, Param, Query } from "@nestjs/common";
import { ProductsQueryDto } from "../products/dto/products-query.dto";
import { CategoriesService } from "./categories.service";

@Controller("categories")
export class PublicCategoriesController {
  constructor(private readonly categories: CategoriesService) {}

  @Get()
  tree() {
    return this.categories.getTree();
  }

  @Get(":slug/products")
  products(@Param("slug") slug: string, @Query() query: ProductsQueryDto) {
    return this.categories.getProductsByCategorySlug(slug, query);
  }

  @Get(":slug")
  bySlug(@Param("slug") slug: string) {
    return this.categories.getBySlug(slug);
  }
}
