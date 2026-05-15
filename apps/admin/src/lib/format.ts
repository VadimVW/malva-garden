export function formatPrice(value: string | { toString(): string }): string {
  const n = Number(String(value));
  if (Number.isNaN(n)) return String(value);
  return new Intl.NumberFormat("uk-UA", {
    style: "currency",
    currency: "UAH",
    maximumFractionDigits: 2,
  }).format(n);
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("uk-UA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  NEW: "Нове",
  PROCESSING: "В обробці",
  SHIPPED: "Відправлено",
  COMPLETED: "Завершено",
  CANCELLED: "Скасовано",
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: "Очікує",
  PAID: "Оплачено",
  FAILED: "Помилка",
};

export const PRODUCT_STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Активний",
  HIDDEN: "Прихований",
};
