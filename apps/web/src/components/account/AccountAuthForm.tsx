"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useCallback, useState } from "react";
import { GoogleSignInButton } from "@/components/account/GoogleSignInButton";
import {
  figmaInputClass,
  FigmaPrimaryButton,
} from "@/components/store/MalvaGardenFigmaPageShell";
import {
  CustomerApiError,
  customerForgotPassword,
  customerResetPassword,
} from "@/lib/customer-api";
import { useCustomerAuth } from "@/providers/CustomerAuthProvider";

const PRIVACY_PAGE = "/pages/konfidenciynist";

export function AccountLoginForm() {
  const { login, loginWithGoogle, isAuthenticated, isLoading } = useCustomerAuth();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("returnUrl") ?? "/account/orders";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleGoogleCredential = useCallback(
    async (credential: string) => {
      setError(null);
      setSubmitting(true);
      try {
        await loginWithGoogle(credential);
        router.replace(next);
      } catch (err) {
        setError(
          err instanceof CustomerApiError
            ? err.message
            : "Не вдалося увійти через Google",
        );
      } finally {
        setSubmitting(false);
      }
    },
    [loginWithGoogle, next, router],
  );

  if (!isLoading && isAuthenticated) {
    router.replace(next);
    return null;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      router.replace(next);
    } catch (err) {
      setError(
        err instanceof CustomerApiError ? err.message : "Не вдалося увійти",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto w-full min-w-0 max-w-md space-y-4">
      <div>
        <label className="mb-1 block text-[13px] font-semibold text-black">
          Email
        </label>
        <input
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={figmaInputClass}
        />
      </div>
      <div>
        <label className="mb-1 block text-[13px] font-semibold text-black">
          Пароль
        </label>
        <input
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={figmaInputClass}
        />
      </div>
      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-800">
          {error}
        </p>
      ) : null}
      <FigmaPrimaryButton type="submit" disabled={submitting} className="w-full">
        {submitting ? "Вхід…" : "Увійти"}
      </FigmaPrimaryButton>
      <div className="flex items-center gap-3 text-[12px] text-[#7a7a7a]">
        <span className="h-px flex-1 bg-[#c5d8dc]" />
        <span>або</span>
        <span className="h-px flex-1 bg-[#c5d8dc]" />
      </div>
      <GoogleSignInButton
        mode="login"
        onCredential={handleGoogleCredential}
        onError={setError}
      />
      <p className="text-center text-[12px] leading-snug text-[#6a6a6a]">
        Продовжуючи з Google, ви погоджуєтесь з{" "}
        <Link href={PRIVACY_PAGE} className="font-semibold text-[#5C97A8] hover:underline">
          політикою конфіденційності
        </Link>
        .
      </p>
      <p className="text-center text-[13px]">
        <Link
          href="/account/forgot-password"
          className="font-semibold text-[#5C97A8] hover:underline"
        >
          Забули пароль?
        </Link>
      </p>
      <p className="text-center text-[14px] text-[#5a5a5a]">
        Немає акаунта?{" "}
        <Link href="/account/register" className="font-semibold text-[#5C97A8] hover:underline">
          Зареєструватися
        </Link>
      </p>
    </form>
  );
}

export function AccountForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [devLink, setDevLink] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setDevLink(null);
    setSubmitting(true);
    try {
      const data = await customerForgotPassword(email);
      setInfo(data.message);
      if (data.resetUrl) setDevLink(data.resetUrl);
    } catch (err) {
      setError(
        err instanceof CustomerApiError
          ? err.message
          : "Не вдалося надіслати лист",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto w-full min-w-0 max-w-md space-y-4">
      <div>
        <label className="mb-1 block text-[13px] font-semibold text-black">
          Email
        </label>
        <input
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={figmaInputClass}
        />
      </div>
      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-800">
          {error}
        </p>
      ) : null}
      {info ? (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-[13px] text-green-900">
          {info}
        </p>
      ) : null}
      {devLink ? (
        <p className="break-all rounded-lg bg-[#E7F1F3] px-3 py-2 text-[12px] text-[#333]">
          Dev:{" "}
          <a href={devLink} className="text-[#5C97A8] underline">
            відновити пароль
          </a>
        </p>
      ) : null}
      <FigmaPrimaryButton type="submit" disabled={submitting} className="w-full">
        {submitting ? "Надсилання…" : "Надіслати посилання"}
      </FigmaPrimaryButton>
      <p className="text-center text-[14px] text-[#5a5a5a]">
        Згадали пароль?{" "}
        <Link href="/account/login" className="font-semibold text-[#5C97A8] hover:underline">
          Увійти
        </Link>
      </p>
    </form>
  );
}

export function AccountResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { refresh } = useCustomerAuth();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!token) {
      setError("Посилання недійсне або прострочене");
      return;
    }
    if (password !== confirmPassword) {
      setError("Паролі не збігаються");
      return;
    }
    setSubmitting(true);
    try {
      await customerResetPassword(token, password);
      await refresh();
      router.replace("/account/orders");
    } catch (err) {
      setError(
        err instanceof CustomerApiError
          ? err.message
          : "Не вдалося оновити пароль",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto w-full min-w-0 max-w-md space-y-4">
      <div>
        <label className="mb-1 block text-[13px] font-semibold text-black">
          Новий пароль
        </label>
        <input
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={figmaInputClass}
        />
      </div>
      <div>
        <label className="mb-1 block text-[13px] font-semibold text-black">
          Повторіть пароль
        </label>
        <input
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={figmaInputClass}
        />
      </div>
      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-800">
          {error}
        </p>
      ) : null}
      <FigmaPrimaryButton type="submit" disabled={submitting} className="w-full">
        {submitting ? "Оновлення…" : "Оновити пароль"}
      </FigmaPrimaryButton>
    </form>
  );
}

export function AccountRegisterForm() {
  const { register, loginWithGoogle, isAuthenticated, isLoading } = useCustomerAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [devLink, setDevLink] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleGoogleCredential = useCallback(
    async (credential: string) => {
      setError(null);
      setInfo(null);
      setDevLink(null);
      setSubmitting(true);
      try {
        await loginWithGoogle(credential);
        router.push("/account/orders");
      } catch (err) {
        setError(
          err instanceof CustomerApiError
            ? err.message
            : "Не вдалося зареєструватися через Google",
        );
      } finally {
        setSubmitting(false);
      }
    },
    [loginWithGoogle, router],
  );

  if (!isLoading && isAuthenticated) {
    router.replace("/account/orders");
    return null;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setDevLink(null);
    if (!acceptPrivacy) {
      setError("Потрібна згода з політикою конфіденційності");
      return;
    }
    setSubmitting(true);
    try {
      const data = await register({
        email,
        password,
        fullName: fullName || undefined,
        phone: phone || undefined,
        acceptPrivacy: true,
      });
      setInfo(
        "Акаунт створено. Підтвердіть email — після цього з’являться попередні замовлення за цим email і телефоном.",
      );
      if (data.verificationUrl) setDevLink(data.verificationUrl);
      router.push("/account/orders");
    } catch (err) {
      setError(
        err instanceof CustomerApiError
          ? err.message
          : "Не вдалося зареєструватися",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto w-full min-w-0 max-w-md space-y-4">
      <div>
        <label className="mb-1 block text-[13px] font-semibold text-black">
          Email *
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={figmaInputClass}
        />
      </div>
      <div>
        <label className="mb-1 block text-[13px] font-semibold text-black">
          Пароль * (мін. 8 символів)
        </label>
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={figmaInputClass}
        />
      </div>
      <div>
        <label className="mb-1 block text-[13px] font-semibold text-black">
          ПІБ
        </label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className={figmaInputClass}
        />
      </div>
      <div>
        <label className="mb-1 block text-[13px] font-semibold text-black">
          Телефон
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={figmaInputClass}
          placeholder="+380…"
        />
      </div>
      <label className="flex items-start gap-2 text-[13px] text-[#333]">
        <input
          type="checkbox"
          checked={acceptPrivacy}
          onChange={(e) => setAcceptPrivacy(e.target.checked)}
          className="mt-1"
          required
        />
        <span>
          Погоджуюсь з{" "}
          <Link
            href={PRIVACY_PAGE}
            target="_blank"
            className="font-semibold text-[#5C97A8] hover:underline"
          >
            політикою конфіденційності
          </Link>
        </span>
      </label>
      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-800">
          {error}
        </p>
      ) : null}
      {info ? (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-[13px] text-green-900">
          {info}
        </p>
      ) : null}
      {devLink ? (
        <p className="break-all rounded-lg bg-[#E7F1F3] px-3 py-2 text-[12px] text-[#333]">
          Dev:{" "}
          <a href={devLink} className="text-[#5C97A8] underline">
            підтвердити email
          </a>
        </p>
      ) : null}
      <FigmaPrimaryButton type="submit" disabled={submitting} className="w-full">
        {submitting ? "Реєстрація…" : "Зареєструватися"}
      </FigmaPrimaryButton>
      <div className="flex items-center gap-3 text-[12px] text-[#7a7a7a]">
        <span className="h-px flex-1 bg-[#c5d8dc]" />
        <span>або</span>
        <span className="h-px flex-1 bg-[#c5d8dc]" />
      </div>
      <GoogleSignInButton
        mode="register"
        onCredential={handleGoogleCredential}
        onError={setError}
      />
      <p className="text-center text-[12px] leading-snug text-[#6a6a6a]">
        Продовжуючи з Google, ви погоджуєтесь з{" "}
        <Link href={PRIVACY_PAGE} className="font-semibold text-[#5C97A8] hover:underline">
          політикою конфіденційності
        </Link>
        .
      </p>
      <p className="text-center text-[14px] text-[#5a5a5a]">
        Вже є акаунт?{" "}
        <Link href="/account/login" className="font-semibold text-[#5C97A8] hover:underline">
          Увійти
        </Link>
      </p>
    </form>
  );
}
