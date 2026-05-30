const TAB_BAR_HIDDEN_PREFIXES = [
  "/checkout",
  "/order/pay",
  "/order/payment/return",
  "/account/login",
  "/account/register",
  "/account/forgot-password",
  "/account/reset-password",
  "/account/verify-email",
] as const;

export function shouldShowMobileTabBar(pathname: string): boolean {
  return !TAB_BAR_HIDDEN_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
