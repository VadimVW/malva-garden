import { IsString, MinLength } from "class-validator";

export class UpsertSiteSettingDto {
  /** Порожній рядок дозволено (напр. `footer_copyright`, опційні URL). */
  @IsString()
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
