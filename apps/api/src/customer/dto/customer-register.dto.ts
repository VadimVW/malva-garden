import {
  Equals,
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";

export class CustomerRegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  fullName?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  phone?: string;

  @IsBoolean()
  @Equals(true, { message: "Потрібна згода з політикою конфіденційності" })
  acceptPrivacy!: boolean;
}
