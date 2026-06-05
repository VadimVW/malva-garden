import { IsInt, IsOptional, Max, Min } from "class-validator";
import { REVIEW_DEFAULT_LIMIT, REVIEW_MAX_LIMIT } from "../review.constants";

export class ReviewsQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(REVIEW_MAX_LIMIT)
  limit?: number = REVIEW_DEFAULT_LIMIT;
}
