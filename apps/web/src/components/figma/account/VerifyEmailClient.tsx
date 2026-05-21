"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { customerFetch } from "@/lib/customer-api";
import { useCustomerAuth } from "@/providers/CustomerAuthProvider";

export function VerifyEmailClient() {
  const params = useSearchParams();
  const token = params.get("token");
  const router = useRouter();
  const { refresh, isAuthenticated } = useCustomerAuth();
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("err");
      setMessage("Посилання недійсне");
      return;
    }
    customerFetch<{ verified: boolean; message?: string }>(
      "/customer/auth/verify-email",
      {
        method: "POST",
        body: JSON.stringify({ token }),
        skipAuth: true,
      },
    )
      .then(async () => {
        setStatus("ok");
        setMessage("Email підтверджено. Попередні замовлення тепер видимі в кабінеті.");
        if (isAuthenticated) await refresh();
        router.replace("/account/orders");
      })
      .catch(() => {
        setStatus("err");
        setMessage("Посилання недійсне або прострочене");
      });
  }, [token, refresh, router, isAuthenticated]);

  return (
    <div className="mx-auto max-w-md text-center">
      {status === "idle" ? (
        <p className="text-[15px] text-[#5C5C5C]">Підтвердження email…</p>
      ) : null}
      {status === "ok" ? (
        <p className="rounded-lg bg-green-50 px-4 py-3 text-[14px] text-green-900">
          {message}
        </p>
      ) : null}
      {status === "err" ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-[14px] text-red-800">
          {message}
        </p>
      ) : null}
      <Link
        href="/account/orders"
        className="mt-6 inline-block font-semibold text-[#5C97A8] hover:underline"
      >
        До замовлень
      </Link>
    </div>
  );
}
