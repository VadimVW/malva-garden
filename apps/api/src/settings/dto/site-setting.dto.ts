import { IsString, MinLength } from "class-validator";

export class UpsertSiteSettingDto {
  @IsString()
  @MinLength(1)
  value!: string;
}

export class CreateSiteSettingDto {
  @IsString()
  @MinLength(1)
  key!: string;

  @IsString()
  @MinLength(1)
  value!: string;
}
