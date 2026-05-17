import { MalvaGardenOrderSuccessDesktop } from "@/components/figma/MalvaGardenOrderSuccessDesktop";

type Props = {
  searchParams: Promise<{ orderNumber?: string; paid?: string }>;
};

export default async function OrderSuccessPage({ searchParams }: Props) {
  const { orderNumber, paid } = await searchParams;
  return (
    <MalvaGardenOrderSuccessDesktop
      orderNumber={orderNumber}
      paidOnline={paid === "1"}
    />
  );
}
