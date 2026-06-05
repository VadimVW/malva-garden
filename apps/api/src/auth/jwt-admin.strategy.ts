import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import type { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "../prisma/prisma.service";
import { ADMIN_ACCESS_COOKIE } from "./admin-auth-cookies";

type JwtPayload = { sub: string; email: string };

function jwtFromCookieOrBearer(req: Request): string | null {
  const fromCookie = req.cookies?.[ADMIN_ACCESS_COOKIE];
  if (typeof fromCookie === "string" && fromCookie.length > 0) {
    return fromCookie;
  }
  return ExtractJwt.fromAuthHeaderAsBearerToken()(req);
}

@Injectable()
export class JwtAdminStrategy extends PassportStrategy(Strategy, "jwt-admin") {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: jwtFromCookieOrBearer,
      ignoreExpiration: false,
      secretOrKey: config.get<string>("JWT_SECRET") ?? "dev-secret-change-me",
    });
  }

  async validate(payload: JwtPayload) {
    const admin = await this.prisma.adminUser.findUnique({
      where: { id: payload.sub },
    });
    if (!admin) throw new UnauthorizedException();
    return { id: admin.id, email: admin.email };
  }
}
