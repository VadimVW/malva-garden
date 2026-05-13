import { IsEmail, IsOptional, IsString, MinLength } from "class-validator";

export class CreateOrderDto {
  @IsString()
  @MinLength(2)
  customerName!: string;

  @IsString()
  @MinLength(6)
  customerPhone!: string;

  @IsOptional()
  @IsEmail()
  customerEmail?: string;

  @IsString()
  @MinLength(2)
  deliveryCity!: string;

  @IsString()
  @MinLength(3)
  deliveryAddress!: string;

  @IsOptional()
  @IsString()
  deliveryMethod?: string;

  @IsString()
  @MinLength(2)
  paymentMethod!: string;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsString()
  @MinLength(10)
  cartToken!: string;
}
