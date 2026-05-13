type Props = {
  searchParams: Promise<{ orderNumber?: string }>;
};

export default async function OrderSuccessPage({ searchParams }: Props) {
  const { orderNumber } = await searchParams;
  return (
    <div className="mx-auto max-w-xl space-y-4 px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold text-emerald-900">
        Дякуємо за замовлення
      </h1>
      {orderNumber ? (
        <p className="text-slate-700">
          Номер замовлення:{" "}
          <span className="font-mono font-medium">{orderNumber}</span>
        </p>
      ) : (
        <p className="text-slate-700">Замовлення прийнято.</p>
      )}
      <p className="text-sm text-slate-500">
        Менеджер побачить замовлення в адмін-панелі.
      </p>
    </div>
  );
}
