import { Suspense } from "react";
import { AccountRegisterForm } from "@/components/figma/account/AccountAuthForm";
import { MalvaGardenFigmaPageShell } from "@/components/figma/MalvaGardenFigmaPageShell";

export default function AccountRegisterPage() {
  return (
    <MalvaGardenFigmaPageShell
      breadcrumbs={[{ label: "Реєстрація" }]}
      title="Реєстрація"
      subtitle="Реєстрація не обов’язкова для покупки в магазині"
    >
      <Suspense fallback={<p className="text-center text-[#5C5C5C]">Завантаження…</p>}>
        <AccountRegisterForm />
      </Suspense>
    </MalvaGardenFigmaPageShell>
  );
}
