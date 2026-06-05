/** Публічне ім'я: «Олена К.» або локальна частина email. */
export function formatReviewAuthorDisplayName(
  fullName: string | null | undefined,
  email: string,
): string {
  const trimmed = fullName?.trim();
  if (trimmed) {
    const parts = trimmed.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      const first = parts[0];
      const lastInitial = parts[parts.length - 1]?.[0]?.toUpperCase();
      return lastInitial ? `${first} ${lastInitial}.` : first;
    }
    return parts[0] ?? trimmed;
  }
  const local = email.split("@")[0]?.trim();
  return local || "Клієнт";
}
