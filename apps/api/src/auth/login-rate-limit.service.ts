import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

type Bucket = { count: number; resetAt: number };

@Injectable()
export class LoginRateLimitService {
  private readonly buckets = new Map<string, Bucket>();

  constructor(private readonly config: ConfigService) {}

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

  assertAllowed(key: string) {
    const now = Date.now();
    const bucket = this.buckets.get(key);
    if (!bucket || now >= bucket.resetAt) return;

    if (bucket.count >= this.maxAttempts()) {
      const retrySec = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
      throw new HttpException(
        `Забагато спроб входу. Спробуйте через ${retrySec} с.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  recordAttempt(key: string) {
    const now = Date.now();
    const windowMs = this.windowMs();
    const bucket = this.buckets.get(key);
    if (!bucket || now >= bucket.resetAt) {
      this.buckets.set(key, { count: 1, resetAt: now + windowMs });
      return;
    }
    bucket.count += 1;
  }

  clear(key: string) {
    this.buckets.delete(key);
  }
}
