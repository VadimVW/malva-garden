import { Suspense } from "react";
import { AccountAuthGuard } from "@/components/account/AccountAuthGuard";
import { MalvaGardenAccountOrdersDesktop } from "@/components/figma/account/MalvaGardenAccountOrdersDesktop";
import { MalvaGardenFigmaPageShell } from "@/components/figma/MalvaGardenFigmaPageShell";

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
