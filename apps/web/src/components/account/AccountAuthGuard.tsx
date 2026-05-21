"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useCustomerAuth } from "@/providers/CustomerAuthProvider";

export function AccountAuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useCustomerAuth();
  const router = useRouter();
  const params = useSearchParams();
  const returnUrl = params.get("returnUrl") ?? "/account/orders";

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(
        `/account/login?returnUrl=${encodeURIComponent(returnUrl)}`,
      );
    }
  }, [isLoading, isAuthenticated, router, returnUrl]);

  if (isLoading || !isAuthenticated) {
    return (
      <p className="py-16 text-center text-[15px] text-[#5C5C5C]">
        Завантаження…
      </p>
    );
  }

  return <>{children}</>;
}
