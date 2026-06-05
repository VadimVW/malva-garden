import { IsInt, IsString, Max, MaxLength, Min, MinLength } from "class-validator";
import {
  REVIEW_BODY_MAX,
  REVIEW_BODY_MIN,
  REVIEW_RATING_MAX,
  REVIEW_RATING_MIN,
} from "../review.constants";

export class CreateReviewDto {
  @IsInt()
  @Min(REVIEW_RATING_MIN)
  @Max(REVIEW_RATING_MAX)
  rating!: number;

  @IsString()
  @MinLength(REVIEW_BODY_MIN)
  @MaxLength(REVIEW_BODY_MAX)
  body!: string;
}
