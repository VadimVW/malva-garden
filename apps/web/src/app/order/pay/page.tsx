import { Suspense } from "react";
import { MalvaGardenOrderPayDesktop } from "@/components/figma/MalvaGardenOrderPayDesktop";

export default function OrderPayPage() {
  return (
    <Suspense fallback={null}>
      <MalvaGardenOrderPayDesktop />
    </Suspense>
  );
}
