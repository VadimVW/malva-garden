import { Suspense } from "react";
import { AccountAuthGuard } from "@/components/account/AccountAuthGuard";
import { MalvaGardenAccountOrdersDesktop } from "@/components/account/MalvaGardenAccountOrdersDesktop";
import { MalvaGardenFigmaPageShell } from "@/components/store/MalvaGardenFigmaPageShell";

export default function AccountOrdersPage() {
  return (
    <MalvaGardenFigmaPageShell
      breadcrumbs={[{ label: "Мої замовлення" }]}
      title="Мої замовлення"
    >
      <Suspense fallback={<p className="text-[#5C5C5C]">Завантаження…</p>}>
        <AccountAuthGuard>
          <MalvaGardenAccountOrdersDesktop />
        </AccountAuthGuard>
      </Suspense>
    </MalvaGardenFigmaPageShell>
  );
}
