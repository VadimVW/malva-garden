import Link from "next/link";
import {
  FigmaSecondaryLink,
  MalvaGardenFigmaPageShell,
} from "@/components/figma/MalvaGardenFigmaPageShell";

type Props = {
  orderNumber?: string;
};

export function MalvaGardenOrderSuccessDesktop({ orderNumber }: Props) {
  return (
    <MalvaGardenFigmaPageShell
      breadcrumbs={[
        { label: "Кошик", href: "/cart" },
        { label: "Замовлення прийнято" },
      ]}
      title="Дякуємо за замовлення!"
      subtitle="Ми вже отримали ваше замовлення та незабаром зв’яжемося з вами"
    >
      <div className="animate-mg-scale-in mx-auto max-w-lg rounded-2xl bg-white px-6 py-12 text-center shadow-[0px_6px_20px_rgba(0,0,0,0.08)] sm:px-10">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#E7F1F3]">
          <svg
            className="size-9 text-[#2f6f4e]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            aria-hidden
          >
            <path
              className="mg-check-path"
              d="M20 6L9 17l-5-5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        {orderNumber ? (
          <p className="mt-6 text-[15px] text-[#5a5a5a]">
            Номер замовлення:{" "}
            <span className="font-mono text-[17px] font-bold text-black">
              {orderNumber}
            </span>
          </p>
        ) : (
          <p className="mt-6 text-[15px] text-[#5a5a5a]">Замовлення успішно створено.</p>
        )}
        <p className="mt-3 text-[14px] leading-relaxed text-[#5a5a5a]">
          Менеджер перевірить наявність товарів і зателефонує для підтвердження.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/catalog/kvity"
            className="mg-btn-primary inline-flex w-full items-center justify-center rounded-xl bg-[#2f6f4e] px-6 py-3.5 text-[15px] font-bold text-white sm:min-w-[200px]"
          >
            До каталогу
          </Link>
          <FigmaSecondaryLink href="/" className="w-full sm:min-w-[200px]">
            На головну
          </FigmaSecondaryLink>
        </div>
      </div>
    </MalvaGardenFigmaPageShell>
  );
}
