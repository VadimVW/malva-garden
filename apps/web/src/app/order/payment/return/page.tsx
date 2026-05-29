import { Suspense } from "react";
import { MalvaGardenOrderPaymentReturnDesktop } from "@/components/store/MalvaGardenOrderPaymentReturnDesktop";

export default function OrderPaymentReturnPage() {
  return (
    <Suspense fallback={null}>
      <MalvaGardenOrderPaymentReturnDesktop />
    </Suspense>
  );
}
