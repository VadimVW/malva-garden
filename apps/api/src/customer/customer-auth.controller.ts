import { Body, Controller, Post } from "@nestjs/common";
import { CustomerAuthService } from "./customer-auth.service";
import { CustomerLoginDto } from "./dto/customer-login.dto";
import { CustomerRegisterDto } from "./dto/customer-register.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { GoogleAuthDto } from "./dto/google-auth.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
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

  @Post("google")
  google(@Body() dto: GoogleAuthDto) {
    return this.auth.google(dto);
  }

  @Post("forgot-password")
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.auth.forgotPassword(dto);
  }

  @Post("reset-password")
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.auth.resetPassword(dto);
  }

  @Post("verify-email")
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.auth.verifyEmail(dto.token);
  }
}
