"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FigmaSecondaryLink,
  MalvaGardenFigmaPageShell,
} from "@/components/figma/MalvaGardenFigmaPageShell";
import { getApiBaseUrl } from "@/lib/api";

type PaymentStatus = "PENDING" | "PAID" | "FAILED";

export function MalvaGardenOrderPaymentReturnDesktop() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber") ?? "";
  const [status, setStatus] = useState<PaymentStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderNumber) {
      setLoading(false);
      return;
    }

    let attempts = 0;
    const maxAttempts = 12;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const poll = async () => {
      try {
        const res = await fetch(
          `${getApiBaseUrl()}/orders/${encodeURIComponent(orderNumber)}/payment-status`,
        );
        if (res.ok) {
          const data = (await res.json()) as { paymentStatus: PaymentStatus };
          setStatus(data.paymentStatus);
          if (data.paymentStatus === "PAID") {
            router.replace(
              `/order/success?orderNumber=${encodeURIComponent(orderNumber)}&paid=1`,
            );
            return;
          }
          if (data.paymentStatus === "FAILED") {
            setLoading(false);
            return;
          }
        }
      } catch {
        /* retry */
      }
      attempts += 1;
      if (attempts < maxAttempts) {
        timer = setTimeout(() => void poll(), 2000);
      } else {
        setLoading(false);
      }
    };

    void poll();
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [orderNumber, router]);

  const title =
    status === "FAILED"
      ? "Оплату не завершено"
      : loading
        ? "Перевіряємо оплату…"
        : "Очікуємо підтвердження";

  const subtitle =
    status === "FAILED"
      ? "Спробуйте ще раз або оберіть інший спосіб оплати."
      : loading
        ? "Це займе кілька секунд."
        : "Якщо гроші вже списані, статус оновиться автоматично.";

  return (
    <MalvaGardenFigmaPageShell
      breadcrumbs={[{ label: "Оплата" }]}
      title={title}
      subtitle={subtitle}
    >
      <div className="mx-auto max-w-lg rounded-2xl bg-white px-6 py-12 text-center shadow-[0px_6px_20px_rgba(0,0,0,0.08)]">
        {loading && status !== "FAILED" ? (
          <div
            className="mx-auto size-10 animate-spin rounded-full border-2 border-[#5C97A8] border-t-transparent"
            aria-hidden
          />
        ) : null}
        {orderNumber ? (
          <p className="mt-6 font-mono text-[15px] text-black">{orderNumber}</p>
        ) : (
          <p className="mt-6 text-[14px] text-red-800">Номер замовлення не знайдено</p>
        )}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {status === "FAILED" && orderNumber ? (
            <Link
              href={`/order/pay?orderNumber=${encodeURIComponent(orderNumber)}`}
              className="mg-btn-primary inline-flex items-center justify-center rounded-xl bg-[#2f6f4e] px-6 py-3.5 text-[15px] font-bold text-white"
            >
              Спробувати ще раз
            </Link>
          ) : null}
          {!loading && status !== "FAILED" && orderNumber ? (
            <Link
              href={`/order/success?orderNumber=${encodeURIComponent(orderNumber)}`}
              className="mg-btn-primary inline-flex items-center justify-center rounded-xl bg-[#2f6f4e] px-6 py-3.5 text-[15px] font-bold text-white"
            >
              До замовлення
            </Link>
          ) : null}
          <FigmaSecondaryLink href="/catalog/kvity">У каталог</FigmaSecondaryLink>
        </div>
      </div>
    </MalvaGardenFigmaPageShell>
  );
}
