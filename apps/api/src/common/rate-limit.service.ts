import { HttpException, HttpStatus, Injectable } from "@nestjs/common";

type Bucket = { count: number; resetAt: number };

@Injectable()
export class RateLimitService {
  private readonly buckets = new Map<string, Bucket>();

  assertAllowed(key: string, maxAttempts: number) {
    const now = Date.now();
    const bucket = this.buckets.get(key);
    if (!bucket || now >= bucket.resetAt) return;

    if (bucket.count >= maxAttempts) {
      const retrySec = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
      throw new HttpException(
        `Забагато запитів. Спробуйте через ${retrySec} с.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  record(key: string, maxAttempts: number, windowMs: number) {
    const now = Date.now();
    const bucket = this.buckets.get(key);
    if (!bucket || now >= bucket.resetAt) {
      this.buckets.set(key, { count: 1, resetAt: now + windowMs });
      return;
    }
    bucket.count += 1;
    if (bucket.count > maxAttempts) {
      bucket.count = maxAttempts;
    }
  }

  throttle(key: string, maxAttempts: number, windowMs: number) {
    this.assertAllowed(key, maxAttempts);
    this.record(key, maxAttempts, windowMs);
  }

  clear(key: string) {
    this.buckets.delete(key);
  }
}
