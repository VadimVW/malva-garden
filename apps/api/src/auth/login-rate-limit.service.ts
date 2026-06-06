import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { RateLimitService } from "../common/rate-limit.service";

@Injectable()
export class LoginRateLimitService {
  constructor(
    private readonly config: ConfigService,
    private readonly rateLimit: RateLimitService,
  ) {}

  private maxAttempts(): number {
    const raw = this.config.get<string>("ADMIN_LOGIN_RATE_LIMIT");
    const n = raw ? Number(raw) : 10;
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 10;
  }

  private windowMs(): number {
    const raw = this.config.get<string>("ADMIN_LOGIN_RATE_TTL_MS");
    const n = raw ? Number(raw) : 15 * 60 * 1000;
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 15 * 60 * 1000;
  }

  private bucketKey(key: string) {
    return `admin-login:${key}`;
  }

  assertAllowed(key: string) {
    this.rateLimit.assertAllowed(this.bucketKey(key), this.maxAttempts());
  }

  recordAttempt(key: string) {
    this.rateLimit.record(
      this.bucketKey(key),
      this.maxAttempts(),
      this.windowMs(),
    );
  }

  clear(key: string) {
    this.rateLimit.clear(this.bucketKey(key));
  }
}
