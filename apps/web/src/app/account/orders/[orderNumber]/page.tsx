import { Suspense } from "react";
import { AccountAuthGuard } from "@/components/account/AccountAuthGuard";
import { MalvaGardenAccountOrderDetailDesktop } from "@/components/figma/account/MalvaGardenAccountOrderDetailDesktop";
import { MalvaGardenFigmaPageShell } from "@/components/figma/MalvaGardenFigmaPageShell";

type Props = {
  params: Promise<{ orderNumber: string }>;
};

export default async function AccountOrderDetailPage({ params }: Props) {
  const { orderNumber } = await params;

  return (
    <MalvaGardenFigmaPageShell
      breadcrumbs={[
        { label: "Мої замовлення", href: "/account/orders" },
        { label: orderNumber },
      ]}
      title={`Замовлення ${orderNumber}`}
    >
      <Suspense fallback={<p className="text-[#5C5C5C]">Завантаження…</p>}>
        <AccountAuthGuard>
          <MalvaGardenAccountOrderDetailDesktop orderNumber={orderNumber} />
        </AccountAuthGuard>
      </Suspense>
    </MalvaGardenFigmaPageShell>
  );
}
