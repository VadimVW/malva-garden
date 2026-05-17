"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FigmaSecondaryLink,
  MalvaGardenFigmaPageShell,
} from "@/components/figma/MalvaGardenFigmaPageShell";
import { getApiBaseUrl } from "@/lib/api";
import { submitWayforpayForm } from "@/lib/wayforpay";

export function MalvaGardenOrderPayDesktop() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber") ?? "";
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderNumber) {
      setError("Не вказано номер замовлення");
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(
          `${getApiBaseUrl()}/orders/${encodeURIComponent(orderNumber)}/payment/wayforpay`,
          { method: "POST" },
        );
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Не вдалося ініціювати оплату");
        }
        const data = (await res.json()) as {
          actionUrl: string;
          fields: Record<string, string | string[]>;
        };
        if (cancelled) return;
        submitWayforpayForm(data.actionUrl, data.fields);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Помилка оплати");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [orderNumber]);

  return (
    <MalvaGardenFigmaPageShell
      breadcrumbs={[
        { label: "Кошик", href: "/cart" },
        { label: "Оформлення", href: "/checkout" },
        { label: "Оплата" },
      ]}
      title="Перехід до оплати"
      subtitle="Зараз відкриється захищена сторінка WayForPay"
    >
      <div className="mx-auto max-w-lg rounded-2xl bg-white px-6 py-12 text-center shadow-[0px_6px_20px_rgba(0,0,0,0.08)]">
        {error ? (
          <>
            <p className="text-[16px] font-bold text-red-800">{error}</p>
            <FigmaSecondaryLink href="/checkout" className="mt-6">
              Назад до оформлення
            </FigmaSecondaryLink>
          </>
        ) : (
          <>
            <div
              className="mx-auto size-10 animate-spin rounded-full border-2 border-[#5C97A8] border-t-transparent"
              aria-hidden
            />
            <p className="mt-6 text-[15px] text-[#5a5a5a]">
              Зачекайте, перенаправляємо на оплату…
            </p>
            {orderNumber ? (
              <p className="mt-2 font-mono text-[14px] text-black">{orderNumber}</p>
            ) : null}
          </>
        )}
      </div>
    </MalvaGardenFigmaPageShell>
  );
}
