/** Формат з `orders.service.ts` → `generateOrderNumber()`. */
const ORDER_NUMBER_RE = /^MG-[A-Z0-9]+-[A-Z0-9]+$/i;
const MAX_LEN = 64;

export function sanitizeOrderNumber(raw: string | null | undefined): string | null {
  const trimmed = raw?.trim();
  if (!trimmed || trimmed.length > MAX_LEN) return null;
  return ORDER_NUMBER_RE.test(trimmed) ? trimmed : null;
}
