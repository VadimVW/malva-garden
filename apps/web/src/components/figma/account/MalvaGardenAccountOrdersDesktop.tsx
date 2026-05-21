"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MalvaGardenAccountNav } from "@/components/figma/account/MalvaGardenAccountNav";
import {
  customerFetch,
  type CustomerOrderSummary,
} from "@/lib/customer-api";
import { useCustomerAuth } from "@/providers/CustomerAuthProvider";

const ORDER_STATUS_UA: Record<string, string> = {
  NEW: "Нове",
  PROCESSING: "В обробці",
  SHIPPED: "Відправлено",
  COMPLETED: "Завершено",
  CANCELLED: "Скасовано",
};

const PAYMENT_STATUS_UA: Record<string, string> = {
  PENDING: "Очікує оплати",
  PAID: "Оплачено",
  FAILED: "Помилка оплати",
};

export function MalvaGardenAccountOrdersDesktop() {
  const { customer, refresh } = useCustomerAuth();
  const [orders, setOrders] = useState<CustomerOrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [resendMsg, setResendMsg] = useState<string | null>(null);
  const [devVerify, setDevVerify] = useState<string | null>(null);

  useEffect(() => {
    customerFetch<{ items: CustomerOrderSummary[] }>("/customer/me/orders?limit=50")
      .then((data) => setOrders(data.items))
      .finally(() => setLoading(false));
  }, []);

  async function resendVerification() {
    setResendMsg(null);
    setDevVerify(null);
    try {
      const res = await customerFetch<{ message: string; verificationUrl?: string }>(
        "/customer/me/resend-verification",
        { method: "POST" },
      );
      setResendMsg(res.message);
      if (res.verificationUrl) setDevVerify(res.verificationUrl);
      await refresh();
    } catch {
      setResendMsg("Не вдалося надіслати посилання");
    }
  }

  return (
    <>
      <MalvaGardenAccountNav />
      {!customer?.emailVerified ? (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[14px] text-amber-950">
          <p>
            Підтвердіть email, щоб побачити попередні замовлення, оформлені до
            реєстрації.
          </p>
          <button
            type="button"
            onClick={resendVerification}
            className="mt-2 font-semibold text-[#5C97A8] hover:underline"
          >
            Надіслати посилання знову
          </button>
          {resendMsg ? <p className="mt-2">{resendMsg}</p> : null}
          {devVerify ? (
            <p className="mt-2 break-all text-[12px]">
              <a href={devVerify} className="underline">
                Dev: підтвердити email
              </a>
            </p>
          ) : null}
        </div>
      ) : null}
      {loading ? (
        <p className="text-[15px] text-[#5C5C5C]">Завантаження…</p>
      ) : orders.length === 0 ? (
        <p className="text-[15px] text-[#5C5C5C]">
          Замовлень поки немає.{" "}
          <Link href="/catalog" className="font-semibold text-[#5C97A8] hover:underline">
            Перейти до каталогу
          </Link>
        </p>
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => (
            <li key={o.id}>
              <Link
                href={`/account/orders/${encodeURIComponent(o.orderNumber)}`}
                className="block rounded-xl border border-[#c5d8dc] bg-white px-4 py-4 transition-colors hover:bg-[#f8fcfd]"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-[15px] font-bold text-black">
                      {o.orderNumber}
                    </p>
                    <p className="mt-1 text-[13px] text-[#5a5a5a]">
                      {new Date(o.createdAt).toLocaleString("uk-UA")}
                    </p>
                  </div>
                  <p className="text-[16px] font-bold text-[#2f6f4e]">
                    {o.totalAmount.includes("грн")
                      ? o.totalAmount
                      : `${o.totalAmount} грн`}
                  </p>
                </div>
                <p className="mt-2 text-[13px] text-[#5C97A8]">
                  {ORDER_STATUS_UA[o.orderStatus] ?? o.orderStatus} ·{" "}
                  {PAYMENT_STATUS_UA[o.paymentStatus] ?? o.paymentStatus}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
