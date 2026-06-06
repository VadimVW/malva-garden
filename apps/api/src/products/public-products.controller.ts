import { Controller, Get, Param, Query } from "@nestjs/common";
import { ProductsQueryDto } from "./dto/products-query.dto";
import { ProductsService } from "./products.service";

@Controller("products")
export class PublicProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get()
  list(@Query() query: ProductsQueryDto) {
    return this.products.findManyPublic(query);
  }

  @Get("leaders")
  leaders() {
    return this.products.findHomeLeaders(6);
  }

  @Get(":slug")
  bySlug(@Param("slug") slug: string) {
    return this.products.findBySlugPublic(slug);
  }
}
