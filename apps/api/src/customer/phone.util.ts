/** Нормалізація UA-телефону для порівняння замовлень (+380XXXXXXXXX). */
export function normalizePhoneUa(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null;
  const digits = raw.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("380") && digits.length === 12) return `+${digits}`;
  if (digits.startsWith("80") && digits.length === 11) return `+3${digits}`;
  if (digits.startsWith("0") && digits.length === 10) return `+38${digits}`;
  if (digits.length === 9) return `+380${digits}`;
  return digits.length >= 10 ? `+${digits}` : null;
}
