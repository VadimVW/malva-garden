import { MalvaGardenOrderSuccessDesktop } from "@/components/figma/MalvaGardenOrderSuccessDesktop";

type Props = {
  searchParams: Promise<{ orderNumber?: string }>;
};

export default async function OrderSuccessPage({ searchParams }: Props) {
  const { orderNumber } = await searchParams;
  return <MalvaGardenOrderSuccessDesktop orderNumber={orderNumber} />;
}
