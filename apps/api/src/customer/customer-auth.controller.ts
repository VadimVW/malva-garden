import { Body, Controller, Post } from "@nestjs/common";
import { CustomerAuthService } from "./customer-auth.service";
import { CustomerLoginDto } from "./dto/customer-login.dto";
import { CustomerRegisterDto } from "./dto/customer-register.dto";
import { VerifyEmailDto } from "./dto/verify-email.dto";

@Controller("customer/auth")
export class CustomerAuthController {
  constructor(private readonly auth: CustomerAuthService) {}

  @Post("register")
  register(@Body() dto: CustomerRegisterDto) {
    return this.auth.register(dto);
  }

  @Post("login")
  login(@Body() dto: CustomerLoginDto) {
    return this.auth.login(dto);
  }

  @Post("verify-email")
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.auth.verifyEmail(dto.token);
  }
}
