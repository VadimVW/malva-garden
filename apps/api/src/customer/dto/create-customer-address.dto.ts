import { IsBoolean, IsOptional, IsString, MinLength } from "class-validator";

export class CreateCustomerAddressDto {
  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsString()
  recipientName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  deliveryMethod?: string;

  @IsString()
  @MinLength(2)
  deliveryCity!: string;

  @IsString()
  @MinLength(3)
  deliveryAddress!: string;

  @IsOptional()
  @IsString()
  novaPoshtaCityRef?: string;

  @IsOptional()
  @IsString()
  novaPoshtaWarehouseRef?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
