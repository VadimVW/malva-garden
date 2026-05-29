import { Suspense } from "react";
import { MalvaGardenOrderPayDesktop } from "@/components/store/MalvaGardenOrderPayDesktop";

export default function OrderPayPage() {
  return (
    <Suspense fallback={null}>
      <MalvaGardenOrderPayDesktop />
    </Suspense>
  );
}
