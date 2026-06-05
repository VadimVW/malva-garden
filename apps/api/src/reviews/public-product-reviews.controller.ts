import { Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { CurrentCustomer } from "../customer/decorators/current-customer.decorator";
import { JwtCustomerAuthGuard } from "../customer/jwt-customer.guard";
import type { CurrentCustomer as CurrentCustomerType } from "../customer/customer.types";
import { CreateReviewDto } from "./dto/create-review.dto";
import { ReviewsQueryDto } from "./dto/reviews-query.dto";
import { ReviewsService } from "./reviews.service";

@Controller("products/:slug/reviews")
export class PublicProductReviewsController {
  constructor(private readonly reviews: ReviewsService) {}

  @Get()
  list(@Param("slug") slug: string, @Query() query: ReviewsQueryDto) {
    return this.reviews.listPublicByProductSlug(slug, query);
  }

  @Get("eligibility")
  @UseGuards(JwtCustomerAuthGuard)
  eligibility(
    @Param("slug") slug: string,
    @CurrentCustomer() customer: CurrentCustomerType,
  ) {
    return this.reviews.getEligibility(slug, customer.id);
  }

  @Post()
  @UseGuards(JwtCustomerAuthGuard)
  create(
    @Param("slug") slug: string,
    @CurrentCustomer() customer: CurrentCustomerType,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviews.createOrResubmit(slug, customer.id, dto);
  }
}
