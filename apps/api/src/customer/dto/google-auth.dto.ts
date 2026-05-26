import { IsBoolean, IsOptional, IsString, MinLength } from "class-validator";

export class GoogleAuthDto {
  @IsString()
  @MinLength(20)
  credential!: string;

  @IsOptional()
  @IsBoolean()
  acceptPrivacy?: boolean;
}
