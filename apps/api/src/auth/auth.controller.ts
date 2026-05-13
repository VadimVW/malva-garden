import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AdminLoginDto } from "./dto/admin-login.dto";

@Controller("admin/auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("login")
  login(@Body() dto: AdminLoginDto) {
    return this.auth.loginAdmin(dto.email, dto.password);
  }
}
