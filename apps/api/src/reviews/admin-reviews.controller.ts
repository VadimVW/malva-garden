import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from "@nestjs/common";
import { JwtAdminAuthGuard } from "../auth/jwt-admin.guard";
import { AdminReviewsQueryDto } from "./dto/admin-reviews-query.dto";
import { UpdateReviewStatusDto } from "./dto/update-review-status.dto";
import { ReviewsService } from "./reviews.service";

@Controller("admin/reviews")
@UseGuards(JwtAdminAuthGuard)
export class AdminReviewsController {
  constructor(private readonly reviews: ReviewsService) {}

  @Get("pending-count")
  pendingCount() {
    return this.reviews.countPendingAdmin();
  }

  @Get()
  list(@Query() query: AdminReviewsQueryDto) {
    return this.reviews.listAdmin(query);
  }

  @Get(":id")
  one(@Param("id") id: string) {
    return this.reviews.findOneAdmin(id);
  }

  @Patch(":id")
  updateStatus(@Param("id") id: string, @Body() dto: UpdateReviewStatusDto) {
    return this.reviews.updateStatusAdmin(id, dto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.reviews.deleteAdmin(id);
  }
}
