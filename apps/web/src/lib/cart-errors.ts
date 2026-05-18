/** Помилка відповіді API кошика */
export class CartApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "CartApiError";
  }
}

/** Кошик видалено, прострочено або токен недійсний */
export function isCartGoneError(error: unknown): boolean {
  if (!(error instanceof CartApiError)) return false;
  if (error.status === 400) {
    return /прострочено|потрібен заголовок/i.test(error.message);
  }
  if (error.status === 404) {
    return /кошик не знайдено/i.test(error.message);
  }
  return false;
}

/** Позицію вже видалено (наприклад, паралельний запит) */
export function isCartLineMissingError(error: unknown): boolean {
  return (
    error instanceof CartApiError &&
    error.status === 404 &&
    /позиція не в кошику/i.test(error.message)
  );
}

export const CART_GONE_MESSAGE =
  "Кошик недійсний або прострочений. Додайте товари з каталогу знову.";
