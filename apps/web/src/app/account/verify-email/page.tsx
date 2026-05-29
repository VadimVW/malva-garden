import { Suspense } from "react";
import { VerifyEmailClient } from "@/components/account/VerifyEmailClient";
import { MalvaGardenFigmaPageShell } from "@/components/store/MalvaGardenFigmaPageShell";

export default function VerifyEmailPage() {
  return (
    <MalvaGardenFigmaPageShell
      breadcrumbs={[
        { label: "Кабінет", href: "/account/orders" },
        { label: "Підтвердження email" },
      ]}
      title="Підтвердження email"
    >
      <Suspense fallback={<p className="text-center text-[#5C5C5C]">Завантаження…</p>}>
        <VerifyEmailClient />
      </Suspense>
    </MalvaGardenFigmaPageShell>
  );
}
