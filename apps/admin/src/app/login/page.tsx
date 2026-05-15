"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export default function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("admin@malva.local");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const reason = params.get("reason");
  const next = params.get("next") ?? "/products";

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(next);
    }
  }, [isLoading, isAuthenticated, router, next]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      router.replace(next);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Не вдалося увійти",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading || isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-admin-bg">
        <p className="text-sm text-admin-muted">Завантаження…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-admin-bg p-4">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-xl font-semibold text-gray-900">Вхід в адмінку</h1>
        <p className="mt-1 text-sm text-admin-muted">
          Malva Garden — керування каталогом і замовленнями
        </p>
        {reason === "idle" && (
          <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Сесію завершено через неактивність. Увійдіть знову.
          </p>
        )}
        {reason === "session" && (
          <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Потрібна повторна авторизація.
          </p>
        )}
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <Input
            label="Email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Пароль"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Вхід…" : "Увійти"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
