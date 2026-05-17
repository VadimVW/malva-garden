import { Suspense } from "react";
import { MalvaGardenOrderPaymentReturnDesktop } from "@/components/figma/MalvaGardenOrderPaymentReturnDesktop";

export default function OrderPaymentReturnPage() {
  return (
    <Suspense fallback={null}>
      <MalvaGardenOrderPaymentReturnDesktop />
    </Suspense>
  );
}
