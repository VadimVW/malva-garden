import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { AdminAuthCookieService } from "./admin-auth-cookie.service";
import {
  readRefreshToken,
  wantsCookieAuth,
} from "./admin-auth-cookies";
import { AdminLoginDto } from "./dto/admin-login.dto";
import { AdminRefreshDto } from "./dto/admin-refresh.dto";
import { clientIp } from "../common/client-ip";
import { JwtAdminAuthGuard } from "./jwt-admin.guard";

type AdminRequestUser = { id: string; email: string };

@Controller("admin/auth")
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly cookies: AdminAuthCookieService,
  ) {}

  @Post("login")
  async login(
    @Body() dto: AdminLoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.auth.loginAdmin(
      dto.email,
      dto.password,
      clientIp(req),
    );
    if (wantsCookieAuth(req)) {
      this.cookies.setTokens(
        res,
        tokens.access_token,
        tokens.refresh_token,
        tokens.expires_in,
        0,
      );
      return { expires_in: tokens.expires_in, auth_mode: "cookie" as const };
    }
    return tokens;
  }

  @Post("refresh")
  async refresh(
    @Body() dto: AdminRefreshDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = readRefreshToken(req, dto.refresh_token);
    if (!refreshToken) {
      throw new UnauthorizedException("Недійсний refresh token");
    }
    const tokens = await this.auth.refreshAdmin(refreshToken);
    if (wantsCookieAuth(req)) {
      this.cookies.setTokens(
        res,
        tokens.access_token,
        tokens.refresh_token,
        tokens.expires_in,
        0,
      );
      return { expires_in: tokens.expires_in, auth_mode: "cookie" as const };
    }
    return tokens;
  }

  @Post("logout")
  async logout(
    @Body() dto: AdminRefreshDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = readRefreshToken(req, dto.refresh_token);
    if (refreshToken) {
      await this.auth.logoutAdmin(refreshToken);
    }
    if (wantsCookieAuth(req) || refreshToken) {
      this.cookies.clear(res);
    }
    return { ok: true };
  }

  @Get("me")
  @UseGuards(JwtAdminAuthGuard)
  me(@Req() req: Request & { user: AdminRequestUser }) {
    return { id: req.user.id, email: req.user.email };
  }
}
