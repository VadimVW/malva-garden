import { Suspense } from "react";
import { AccountAuthGuard } from "@/components/account/AccountAuthGuard";
import { MalvaGardenAccountProfileDesktop } from "@/components/figma/account/MalvaGardenAccountProfileDesktop";
import { MalvaGardenFigmaPageShell } from "@/components/figma/MalvaGardenFigmaPageShell";

export default function AccountProfilePage() {
  return (
    <MalvaGardenFigmaPageShell
      breadcrumbs={[{ label: "Профіль" }]}
      title="Профіль і адреси"
    >
      <Suspense fallback={<p className="text-[#5C5C5C]">Завантаження…</p>}>
        <AccountAuthGuard>
          <MalvaGardenAccountProfileDesktop />
        </AccountAuthGuard>
      </Suspense>
    </MalvaGardenFigmaPageShell>
  );
}
