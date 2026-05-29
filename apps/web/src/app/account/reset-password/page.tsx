import { Suspense } from "react";
import { AccountResetPasswordForm } from "@/components/account/AccountAuthForm";
import { MalvaGardenFigmaPageShell } from "@/components/store/MalvaGardenFigmaPageShell";

export default function AccountResetPasswordPage() {
  return (
    <MalvaGardenFigmaPageShell
      breadcrumbs={[
        { label: "Вхід", href: "/account/login" },
        { label: "Новий пароль" },
      ]}
      title="Новий пароль"
      subtitle="Створіть новий пароль для особистого кабінету"
    >
      <Suspense fallback={<p className="text-center text-[#5C5C5C]">Завантаження…</p>}>
        <AccountResetPasswordForm />
      </Suspense>
    </MalvaGardenFigmaPageShell>
  );
}
