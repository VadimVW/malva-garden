import { Suspense } from "react";
import { AccountLoginForm } from "@/components/account/AccountAuthForm";
import { MalvaGardenFigmaPageShell } from "@/components/store/MalvaGardenFigmaPageShell";

export default function AccountLoginPage() {
  return (
    <MalvaGardenFigmaPageShell
      breadcrumbs={[{ label: "Вхід" }]}
      title="Вхід"
      subtitle="Увійдіть, щоб переглядати замовлення та збережені адреси"
    >
      <Suspense fallback={<p className="text-center text-[#5C5C5C]">Завантаження…</p>}>
        <AccountLoginForm />
      </Suspense>
    </MalvaGardenFigmaPageShell>
  );
}
