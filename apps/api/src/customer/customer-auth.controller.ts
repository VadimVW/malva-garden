import { Body, Controller, Post, Req } from "@nestjs/common";
import type { Request } from "express";
import { clientIp } from "../common/client-ip";
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
  register(@Body() dto: CustomerRegisterDto, @Req() req: Request) {
    return this.auth.register(dto, clientIp(req));
  }

  @Post("login")
  login(@Body() dto: CustomerLoginDto, @Req() req: Request) {
    return this.auth.login(dto, clientIp(req));
  }

  @Post("google")
  google(@Body() dto: GoogleAuthDto, @Req() req: Request) {
    return this.auth.google(dto, clientIp(req));
  }

  @Post("forgot-password")
  forgotPassword(@Body() dto: ForgotPasswordDto, @Req() req: Request) {
    return this.auth.forgotPassword(dto, clientIp(req));
  }

  @Post("reset-password")
  resetPassword(@Body() dto: ResetPasswordDto, @Req() req: Request) {
    return this.auth.resetPassword(dto, clientIp(req));
  }

  @Post("verify-email")
  verifyEmail(@Body() dto: VerifyEmailDto, @Req() req: Request) {
    return this.auth.verifyEmail(dto.token, clientIp(req));
  }
}
