import {
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { createHash, randomBytes } from "crypto";
import { PrismaService } from "../prisma/prisma.service";
import { LoginRateLimitService } from "./login-rate-limit.service";

type AdminTokens = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly loginRateLimit: LoginRateLimitService,
  ) {}

  private accessTokenTtl(): string {
    return this.config.get<string>("ADMIN_ACCESS_TOKEN_TTL")?.trim() || "15m";
  }

  private refreshTokenDays(): number {
    const raw = this.config.get<string>("ADMIN_REFRESH_TOKEN_TTL_DAYS");
    const n = raw ? Number(raw) : 7;
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 7;
  }

  private accessExpiresInSeconds(): number {
    const ttl = this.accessTokenTtl();
    const m = ttl.match(/^(\d+)([smhd])$/);
    if (!m) return 900;
    const value = Number(m[1]);
    const unit = m[2];
    const mult =
      unit === "s" ? 1 : unit === "m" ? 60 : unit === "h" ? 3600 : 86400;
    return value * mult;
  }

  private tokenHash(token: string) {
    return createHash("sha256").update(token).digest("hex");
  }

  private async signAccessToken(admin: { id: string; email: string }) {
    return this.jwt.signAsync(
      { sub: admin.id, email: admin.email, role: "admin" },
      { expiresIn: this.accessTokenTtl() },
    );
  }

  private async issueRefreshToken(adminId: string) {
    const raw = randomBytes(32).toString("base64url");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.refreshTokenDays());
    await this.prisma.adminRefreshToken.create({
      data: {
        adminId,
        tokenHash: this.tokenHash(raw),
        expiresAt,
      },
    });
    return raw;
  }

  private async issueAdminTokens(admin: {
    id: string;
    email: string;
  }): Promise<AdminTokens> {
    const [access_token, refresh_token] = await Promise.all([
      this.signAccessToken(admin),
      this.issueRefreshToken(admin.id),
    ]);
    return {
      access_token,
      refresh_token,
      expires_in: this.accessExpiresInSeconds(),
    };
  }

  async loginAdmin(email: string, password: string, rateLimitKey: string) {
    this.loginRateLimit.assertAllowed(rateLimitKey);
    const admin = await this.prisma.adminUser.findUnique({ where: { email } });
    if (!admin) {
      this.loginRateLimit.recordAttempt(rateLimitKey);
      throw new UnauthorizedException("Невірний email або пароль");
    }
    const ok = await bcrypt.compare(password, admin.passwordHash);
    if (!ok) {
      this.loginRateLimit.recordAttempt(rateLimitKey);
      throw new UnauthorizedException("Невірний email або пароль");
    }
    this.loginRateLimit.clear(rateLimitKey);
    return this.issueAdminTokens(admin);
  }

  async refreshAdmin(refreshToken: string) {
    const hash = this.tokenHash(refreshToken);
    const stored = await this.prisma.adminRefreshToken.findUnique({
      where: { tokenHash: hash },
      include: { admin: true },
    });
    if (
      !stored ||
      stored.revokedAt ||
      stored.expiresAt.getTime() <= Date.now()
    ) {
      throw new UnauthorizedException("Недійсний refresh token");
    }

    await this.prisma.adminRefreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    return this.issueAdminTokens(stored.admin);
  }

  async logoutAdmin(refreshToken: string) {
    const hash = this.tokenHash(refreshToken);
    await this.prisma.adminRefreshToken.updateMany({
      where: { tokenHash: hash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return { ok: true };
  }
}
