import { createHash, randomBytes } from "crypto";

export function generatePaymentAccessToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashPaymentAccessToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function verifyPaymentAccessToken(
  token: string | undefined,
  storedHash: string | null | undefined,
): boolean {
  if (!token?.trim() || !storedHash) return false;
  return hashPaymentAccessToken(token.trim()) === storedHash;
}
