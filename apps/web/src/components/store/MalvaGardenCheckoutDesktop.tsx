"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import {
  figmaInputClass,
  FigmaPrimaryButton,
  FigmaSecondaryLink,
  MalvaGardenFigmaPageShell,
} from "@/components/store/MalvaGardenFigmaPageShell";
import {
  CheckoutPageSkeleton,
  CheckoutSummarySkeleton,
} from "@/components/ui/MgSkeleton";
import { FigmaSelect } from "@/components/checkout/FigmaSelect";
import {
  NovaPoshtaCheckoutFields,
  type NovaPoshtaPrefill,
  type NovaPoshtaSelection,
} from "@/components/checkout/NovaPoshtaCheckoutFields";
import { getApiBaseUrl } from "@/lib/api";
import { fetchCart } from "@/lib/cart-api";
import { isCartGoneError } from "@/lib/cart-errors";
import type { CartResponse } from "@/lib/cart-types";
import { clearCartToken, getCartToken } from "@/lib/cart-token";
import {
  clearPaymentAccessToken,
  storePaymentAccessToken,
} from "@/lib/payment-access";
import {
  customerAddressToNpPrefill,
  pickDefaultNovaPoshtaAddress,
} from "@/lib/customer-checkout-prefill";
import { customerFetch, type CustomerAddress } from "@/lib/customer-api";
import { getCustomerToken } from "@/lib/customer-auth";
import { useCustomerAuth } from "@/providers/CustomerAuthProvider";
import {
  dispatchCartUpdated,
  MG_CART_UPDATED,
  type CartUpdatedDetail,
} from "@/lib/cart-ui-events";
import {
  formatOrderMinimumShortfallMessage,
  isBelowOrderMinimum,
} from "@/lib/orderMinimum";
import { useStoreHeaderSettings } from "@/providers/StoreHeaderSettingsProvider";

function formatPrice(value: string) {
  return value.includes("грн") ? value : `${value} грн`;
}

function labelClass() {
  return "block text-[13px] font-semibold text-black";
}

function OrderSummary({
  cart,
  orderMinimumAmount,
}: {
  cart: CartResponse;
  orderMinimumAmount: number;
}) {
  const count = cart.items.reduce((n, i) => n + i.quantity, 0);
  const belowMinimum = isBelowOrderMinimum(cart.subtotal, orderMinimumAmount);
  return (
    <aside className="animate-mg-fade-in rounded-2xl bg-white p-6 shadow-[0px_6px_20px_rgba(0,0,0,0.08)] lg:sticky lg:top-[140px]">
      <h2 className="text-[18px] font-bold text-black">Ваше замовлення</h2>
      <ul className="mt-4 max-h-[280px] space-y-3 overflow-y-auto pr-1">
        {cart.items.map((item) => (
          <li
            key={item.productId}
            className="flex justify-between gap-3 border-b border-[#eef2f3] pb-3 text-[13px] last:border-0 last:pb-0"
          >
            <span className="min-w-0 flex-1 text-[#333]">
              {item.name}{" "}
              <span className="text-[#9C9A9A]">× {item.quantity}</span>
            </span>
            <span className="shrink-0 font-semibold text-black">
              {formatPrice(item.lineTotal)}
            </span>
          </li>
        ))}
      </ul>
      <dl className="mt-5 space-y-2 border-t border-[#e0e8ea] pt-4 text-[14px]">
        <div className="flex justify-between gap-4">
          <dt className="text-[#5a5a5a]">Позицій</dt>
          <dd className="font-medium text-black">{count}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-[16px] font-bold text-black">До сплати</dt>
          <dd className="text-[20px] font-bold text-black">{formatPrice(cart.subtotal)}</dd>
        </div>
      </dl>
      {belowMinimum ? (
        <p
          className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[13px] leading-snug text-amber-950"
          role="status"
        >
          {formatOrderMinimumShortfallMessage(orderMinimumAmount, cart.subtotal)}
        </p>
      ) : null}
      <p className="mt-4 text-[12px] leading-snug text-[#5a5a5a]">
        Натискаючи «Підтвердити», ви погоджуєтесь з{" "}
        <Link href="/pages/publichna-oferta" className="text-[#5C97A8] underline">
          публічною офертою
        </Link>
        .
      </p>
    </aside>
  );
}

async function readOrderError(res: Response): Promise<string> {
  const text = await res.text();
  try {
    const json = JSON.parse(text) as { message?: string | string[] };
    if (Array.isArray(json.message)) return json.message.join(", ");
    if (typeof json.message === "string") return json.message;
  } catch {
    /* plain text */
  }
  return text || res.statusText;
}

export function MalvaGardenCheckoutDesktop() {
  const router = useRouter();
  const { orderMinimumAmount } = useStoreHeaderSettings();
  const { customer, isLoading: authLoading } = useCustomerAuth();
  const [mounted, setMounted] = useState(false);
  const [cartLoading, setCartLoading] = useState(true);
  const [summaryRefreshing, setSummaryRefreshing] = useState(false);
  const [cart, setCart] = useState<CartResponse | null>(null);
  const initialLoadDone = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState("nova_poshta");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [npPrefill, setNpPrefill] = useState<NovaPoshtaPrefill | null>(null);
  const [npFieldsKey, setNpFieldsKey] = useState("guest");
  const [checkoutPrefilled, setCheckoutPrefilled] = useState(false);
  const [npSelection, setNpSelection] = useState<NovaPoshtaSelection>({
    cityLabel: "",
    warehouseLabel: "",
    cityRef: "",
    warehouseRef: "",
    complete: false,
  });

  const onNpSelectionChange = useCallback((selection: NovaPoshtaSelection) => {
    setNpSelection(selection);
  }, []);

  useEffect(() => {
    if (authLoading || !customer || checkoutPrefilled) return;

    setCustomerName(customer.fullName ?? "");
    setCustomerPhone(customer.phone ?? "");
    setCustomerEmail(customer.email);

    let cancelled = false;
    void (async () => {
      try {
        const { items } = await customerFetch<{ items: CustomerAddress[] }>(
          "/customer/me/addresses",
        );
        if (cancelled) return;
        const defaultAddr = pickDefaultNovaPoshtaAddress(items);
        if (defaultAddr) {
          const prefill = customerAddressToNpPrefill(defaultAddr);
          setNpPrefill(prefill);
          setNpFieldsKey(`prefill-${defaultAddr.id}`);
          setNpSelection({
            cityLabel: prefill.city.label,
            warehouseLabel: prefill.warehouse.description,
            cityRef: prefill.city.deliveryCityRef,
            warehouseRef: prefill.warehouse.ref,
            complete: true,
          });
        }
      } catch {
        /* profile fields still applied */
      } finally {
        if (!cancelled) setCheckoutPrefilled(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authLoading, customer, checkoutPrefilled]);

  const loadCartSummary = useCallback(async (background = false) => {
    const token = getCartToken();
    if (!token) {
      setCart(null);
      setCartLoading(false);
      initialLoadDone.current = true;
      return;
    }
    if (background) {
      setSummaryRefreshing(true);
    }
    try {
      const data = await fetchCart(token);
      if (!data) {
        clearCartToken();
        setCart(null);
        return;
      }
      setCart(data);
    } catch (e) {
      if (isCartGoneError(e)) {
        clearCartToken();
        setCart(null);
      }
    } finally {
      setCartLoading(false);
      setSummaryRefreshing(false);
      initialLoadDone.current = true;
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    void loadCartSummary();
  }, [loadCartSummary]);

  useEffect(() => {
    function onCartEvent(e: Event) {
      const detail = (e as CustomEvent<CartUpdatedDetail>).detail;
      if (detail?.sync || detail?.reload) {
        const token = getCartToken();
        if (!token) {
          setCart(null);
          return;
        }
        void loadCartSummary(true);
      }
    }
    window.addEventListener(MG_CART_UPDATED, onCartEvent);
    return () => window.removeEventListener(MG_CART_UPDATED, onCartEvent);
  }, [loadCartSummary]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const t = getCartToken();
    if (!t) {
      setError("Немає кошика. Додайте товар.");
      return;
    }

    const method = deliveryMethod;
    if (method === "nova_poshta" && !npSelection.complete) {
      setError("Оберіть місто та відділення / поштомат Нової пошти.");
      return;
    }

    if (cart && isBelowOrderMinimum(cart.subtotal, orderMinimumAmount)) {
      setError(
        formatOrderMinimumShortfallMessage(orderMinimumAmount, cart.subtotal),
      );
      return;
    }

    const form = new FormData(e.currentTarget);
    const body = {
      customerName: String(form.get("customerName") ?? ""),
      customerPhone: String(form.get("customerPhone") ?? ""),
      customerEmail: String(form.get("customerEmail") ?? "") || undefined,
      deliveryCity:
        method === "pickup"
          ? "Самовивіз"
          : String(form.get("deliveryCity") ?? ""),
      deliveryAddress:
        method === "pickup"
          ? "Самовивіз"
          : String(form.get("deliveryAddress") ?? ""),
      deliveryMethod: method || undefined,
      paymentMethod: String(form.get("paymentMethod") ?? ""),
      comment: String(form.get("comment") ?? "") || undefined,
      cartToken: t,
    };
    setLoading(true);
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      const customerToken = getCustomerToken();
      if (customerToken) {
        headers.Authorization = `Bearer ${customerToken}`;
      }

      const res = await fetch(`${getApiBaseUrl()}/orders`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(await readOrderError(res));
      const data = (await res.json()) as {
        orderNumber: string;
        paymentMethod?: string;
        paymentAccessToken?: string;
      };
      clearCartToken();
      dispatchCartUpdated(0);
      if (data.paymentMethod === "wayforpay") {
        if (data.paymentAccessToken) {
          storePaymentAccessToken(data.orderNumber, data.paymentAccessToken);
        }
        router.push(
          `/order/pay?orderNumber=${encodeURIComponent(data.orderNumber)}`,
        );
      } else {
        clearPaymentAccessToken(data.orderNumber);
        router.push(
          `/order/success?orderNumber=${encodeURIComponent(data.orderNumber)}`,
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Помилка оформлення");
    } finally {
      setLoading(false);
    }
  }

  const hasToken = mounted && Boolean(getCartToken());
  const showSkeleton = !mounted || (hasToken && cartLoading);
  const isNovaPoshta = deliveryMethod === "nova_poshta";
  const belowMinimum =
    cart != null && isBelowOrderMinimum(cart.subtotal, orderMinimumAmount);

  return (
    <MalvaGardenFigmaPageShell
      breadcrumbs={[
        { label: "Кошик", href: "/cart" },
        { label: "Оформлення" },
      ]}
      title="Оформлення замовлення"
      subtitle="Заповніть контактні дані та адресу доставки"
    >
      {showSkeleton ? (
        <CheckoutPageSkeleton />
      ) : !hasToken ? (
        <div className="animate-mg-scale-in rounded-2xl bg-white px-6 py-12 text-center shadow-[0px_6px_20px_rgba(0,0,0,0.08)]">
          <p className="text-[18px] font-bold text-black">Кошик порожній</p>
          <p className="mt-2 text-[14px] text-[#5a5a5a]">
            Спочатку додайте товари, щоб оформити замовлення.
          </p>
          <FigmaSecondaryLink href="/catalog/kvity" className="mt-6">
            У каталог
          </FigmaSecondaryLink>
        </div>
      ) : (
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
          <form
            className="mg-stagger-form min-w-0 flex-1 space-y-6 overflow-visible rounded-2xl bg-white p-6 shadow-[0px_6px_20px_rgba(0,0,0,0.08)] sm:p-8"
            onSubmit={(e) => void onSubmit(e)}
          >
            {error ? (
              <p
                className="mg-alert-error rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-800"
                role="alert"
              >
                {error}
              </p>
            ) : null}

            <fieldset className="space-y-4">
              <legend className="text-[16px] font-bold text-black">Контакти</legend>
              {customer && checkoutPrefilled ? (
                <p className="text-[13px] text-[#5a5a5a]">
                  Дані заповнено з вашого профілю. Можете змінити перед підтвердженням.
                </p>
              ) : null}
              <label className="block space-y-1.5">
                <span className={labelClass()}>Ім’я та прізвище *</span>
                <input
                  required
                  name="customerName"
                  autoComplete="name"
                  className={figmaInputClass}
                  placeholder="Олена Коваленко"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </label>
              <label className="block space-y-1.5">
                <span className={labelClass()}>Телефон *</span>
                <input
                  required
                  name="customerPhone"
                  type="tel"
                  autoComplete="tel"
                  className={figmaInputClass}
                  placeholder="+380 XX XXX XX XX"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
              </label>
              <label className="block space-y-1.5">
                <span className={labelClass()}>Email</span>
                <input
                  name="customerEmail"
                  type="email"
                  autoComplete="email"
                  className={figmaInputClass}
                  placeholder="email@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                />
              </label>
            </fieldset>

            <fieldset className="relative z-20 space-y-4 overflow-visible">
              <legend className="text-[16px] font-bold text-black">Доставка</legend>
              <FigmaSelect
                label="Спосіб доставки"
                name="deliveryMethod"
                value={deliveryMethod}
                onChange={setDeliveryMethod}
                options={[
                  { value: "nova_poshta", label: "Нова пошта" },
                  { value: "pickup", label: "Самовивіз" },
                ]}
              />

              {isNovaPoshta ? (
                <NovaPoshtaCheckoutFields
                  key={npFieldsKey}
                  initialPrefill={npPrefill}
                  onSelectionChange={onNpSelectionChange}
                />
              ) : (
                <>
                  <input type="hidden" name="deliveryCity" value="Самовивіз" />
                  <input type="hidden" name="deliveryAddress" value="Самовивіз" />
                </>
              )}
            </fieldset>

            <fieldset className="relative z-10 space-y-4">
              <legend className="text-[16px] font-bold text-black">Оплата</legend>
              <label className="block space-y-1.5">
                <span className={labelClass()}>Спосіб оплати *</span>
                <select
                  required
                  name="paymentMethod"
                  className={figmaInputClass}
                  defaultValue="wayforpay"
                >
                  {/*<option value="cash_on_delivery">Оплата при отриманні</option>*/}
                  <option value="wayforpay">
                    Онлайн (картка, Apple Pay, Google Pay, WayForPay)
                  </option>
                </select>
              </label>
              <label className="block space-y-1.5">
                <span className={labelClass()}>Коментар до замовлення</span>
                <textarea
                  name="comment"
                  rows={3}
                  className={`${figmaInputClass} min-h-[96px] resize-y`}
                  placeholder="Зручний час дзвінка, побажання щодо упаковки…"
                />
              </label>
            </fieldset>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
              <FigmaPrimaryButton
                type="submit"
                disabled={loading || belowMinimum}
                className="w-full sm:flex-1"
              >
                {loading ? "Відправка…" : "Підтвердити замовлення"}
              </FigmaPrimaryButton>
              <FigmaSecondaryLink href="/cart" className="w-full sm:w-auto">
                Назад до кошика
              </FigmaSecondaryLink>
            </div>
          </form>

          {cartLoading || summaryRefreshing ? (
            <div className="w-full shrink-0 lg:w-[320px]">
              <CheckoutSummarySkeleton />
            </div>
          ) : cart && cart.items.length > 0 ? (
            <div className="w-full shrink-0 lg:w-[320px]">
              <OrderSummary cart={cart} orderMinimumAmount={orderMinimumAmount} />
            </div>
          ) : null}
        </div>
      )}
    </MalvaGardenFigmaPageShell>
  );
}
