import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Response } from "express";
import {
  clearAdminAuthCookies,
  setAdminAuthCookies,
  type CookieAuthOptions,
} from "./admin-auth-cookies";

@Injectable()
export class AdminAuthCookieService {
  constructor(private readonly config: ConfigService) {}

  cookieOptions(accessMaxAgeSec: number, refreshMaxAgeSec: number): CookieAuthOptions {
    const domain = this.config.get<string>("ADMIN_COOKIE_DOMAIN")?.trim();
    return {
      secure:
        this.config.get<string>("NODE_ENV") === "production" ||
        this.config.get<string>("ADMIN_COOKIE_SECURE") === "true",
      domain: domain || undefined,
      accessMaxAgeSec,
      refreshMaxAgeSec,
    };
  }

  setTokens(
    res: Response,
    accessToken: string,
    refreshToken: string,
    accessMaxAgeSec: number,
    refreshMaxAgeSec: number,
  ) {
    const refreshDays = Number(this.config.get("ADMIN_REFRESH_TOKEN_TTL_DAYS") ?? 7);
    const refreshMaxAge =
      refreshMaxAgeSec > 0
        ? refreshMaxAgeSec
        : Math.floor(refreshDays * 86400);
    setAdminAuthCookies(res, accessToken, refreshToken, this.cookieOptions(accessMaxAgeSec, refreshMaxAge));
  }

  clear(res: Response) {
    const opts = this.cookieOptions(0, 0);
    clearAdminAuthCookies(res, opts);
  }
}
