import { Module } from "@nestjs/common";
import { CustomerModule } from "../customer/customer.module";
import { AdminReviewsController } from "./admin-reviews.controller";
import { PublicProductReviewsController } from "./public-product-reviews.controller";
import { ReviewsService } from "./reviews.service";

@Module({
  imports: [CustomerModule],
  controllers: [PublicProductReviewsController, AdminReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
