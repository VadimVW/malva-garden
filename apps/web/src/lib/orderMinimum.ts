/** Сума з API кошика (`subtotal`) у грн. */
export function parseSubtotalUah(subtotal: string): number {
  const cleaned = subtotal.replace(/\s/g, "").replace(",", ".");
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

export function isBelowOrderMinimum(
  subtotal: string,
  minimumUah: number,
): boolean {
  return parseSubtotalUah(subtotal) < minimumUah;
}

export function formatOrderMinimumShortfallMessage(
  minimumUah: number,
  subtotal: string,
): string {
  const current = parseSubtotalUah(subtotal);
  const shortfall = Math.max(0, Math.ceil(minimumUah - current));
  return `Мінімальна сума замовлення — ${minimumUah} грн. Додайте товарів ще на ${shortfall} грн.`;
}
