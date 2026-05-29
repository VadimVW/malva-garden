import { AccountForgotPasswordForm } from "@/components/account/AccountAuthForm";
import { MalvaGardenFigmaPageShell } from "@/components/store/MalvaGardenFigmaPageShell";

export default function AccountForgotPasswordPage() {
  return (
    <MalvaGardenFigmaPageShell
      breadcrumbs={[
        { label: "Вхід", href: "/account/login" },
        { label: "Відновлення пароля" },
      ]}
      title="Відновлення пароля"
      subtitle="Вкажіть email, і ми надішлемо посилання для створення нового пароля"
    >
      <AccountForgotPasswordForm />
    </MalvaGardenFigmaPageShell>
  );
}
