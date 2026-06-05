import { IsOptional, IsString } from "class-validator";

export class AdminRefreshDto {
  /** Bearer mode (dev). У cookie mode refresh береться з httpOnly cookie. */
  @IsOptional()
  @IsString()
  refresh_token?: string;
}
