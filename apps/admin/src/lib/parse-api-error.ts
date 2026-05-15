export function parseApiError(body: string, status: number): string {
  if (!body) {
    if (status === 401) return "Сесія закінчилась. Увійдіть знову.";
    if (status === 403) return "Немає доступу.";
    return `Помилка сервера (${status})`;
  }
  try {
    const json = JSON.parse(body) as {
      message?: string | string[];
      error?: string;
    };
    const msg = json.message;
    if (Array.isArray(msg)) return msg.join(", ");
    if (typeof msg === "string") return msg;
    if (json.error) return json.error;
  } catch {
    /* plain text */
  }
  return body.length > 200 ? `${body.slice(0, 200)}…` : body;
}
