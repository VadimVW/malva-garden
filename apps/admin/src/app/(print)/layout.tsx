"use client";

import { AuthGuard } from "@/components/AuthGuard";

/** Макет без sidebar — для сторінок друку (§7.23.3). */
export default function PrintLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
