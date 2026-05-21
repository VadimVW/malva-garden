import { getApiBaseUrl } from "@/lib/api";
import {
  clearCustomerToken,
  getCustomerToken,
  setCustomerToken,
} from "@/lib/customer-auth";
import { CART_TOKEN_KEY, setCartToken } from "@/lib/cart-token";
import { dispatchCartUpdated } from "@/lib/cart-ui-events";

export class CustomerApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "CustomerApiError";
  }
}

export type CustomerProfile = {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  emailVerified: boolean;
  emailVerifiedAt: string | null;
  privacyAcceptedAt: string;
  createdAt: string;
};

export type CustomerAddress = {
  id: string;
  label: string | null;
  recipientName: string | null;
  phone: string | null;
  deliveryMethod: string | null;
  deliveryCity: string;
  deliveryAddress: string;
  novaPoshtaCityRef: string | null;
  novaPoshtaWarehouseRef: string | null;
  isDefault: boolean;
};

export type CustomerOrderSummary = {
  id: string;
  orderNumber: string;
  orderStatus: string;
  paymentStatus: string;
  totalAmount: string;
  createdAt: string;
  customerName: string;
};

function parseErrorMessage(text: string, status: number): string {
  try {
    const json = JSON.parse(text) as { message?: string | string[] };
    if (Array.isArray(json.message)) return json.message.join(", ");
    if (typeof json.message === "string") return json.message;
  } catch {
    /* ignore */
  }
  if (status === 401) return "Потрібно увійти";
  return text || `Помилка ${status}`;
}

export async function customerFetch<T>(
  path: string,
  init?: RequestInit & { skipAuth?: boolean },
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string> | undefined),
  };

  if (!init?.skipAuth) {
    const token = getCustomerToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const url = `${getApiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, { ...init, headers, cache: "no-store" });
  if (!res.ok) {
    const text = await res.text();
    throw new CustomerApiError(parseErrorMessage(text, res.status), res.status);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export async function mergeCartAfterLogin(guestCartToken: string | null) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getCustomerToken()}`,
  };
  if (guestCartToken) headers["X-Cart-Token"] = guestCartToken;

  const res = await fetch(`${getApiBaseUrl()}/cart/merge`, {
    method: "POST",
    headers,
  });
  if (!res.ok) return;
  const data = (await res.json()) as { token?: string };
  if (data.token) {
    setCartToken(data.token);
    dispatchCartUpdated();
  }
}

export async function customerLogin(email: string, password: string) {
  const guestToken =
    typeof window !== "undefined"
      ? window.localStorage.getItem(CART_TOKEN_KEY)
      : null;

  const data = await customerFetch<{
    access_token: string;
    customer: CustomerProfile;
  }>("/customer/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
    skipAuth: true,
  });

  setCustomerToken(data.access_token);
  await mergeCartAfterLogin(guestToken);
  return data.customer;
}

export async function customerRegister(input: {
  email: string;
  password: string;
  fullName?: string;
  phone?: string;
  acceptPrivacy: boolean;
}) {
  const guestToken =
    typeof window !== "undefined"
      ? window.localStorage.getItem(CART_TOKEN_KEY)
      : null;

  const data = await customerFetch<{
    access_token: string;
    customer: CustomerProfile;
    verificationUrl?: string;
    message?: string;
  }>("/customer/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
    skipAuth: true,
  });

  setCustomerToken(data.access_token);
  await mergeCartAfterLogin(guestToken);
  return data;
}

export function customerLogout() {
  clearCustomerToken();
}
