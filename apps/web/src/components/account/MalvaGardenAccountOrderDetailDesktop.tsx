"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MalvaGardenAccountNav } from "@/components/account/MalvaGardenAccountNav";
import { customerFetch } from "@/lib/customer-api";

type OrderDetail = {
  orderNumber: string;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string | null;
  totalAmount: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  deliveryMethod: string | null;
  deliveryCity: string | null;
  deliveryAddress: string | null;
  comment: string | null;
  createdAt: string;
  items: {
    productNameSnapshot: string;
    priceSnapshot: string;
    quantity: number;
    total: string;
  }[];
};

export function MalvaGardenAccountOrderDetailDesktop({
  orderNumber,
}: {
  orderNumber: string;
}) {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    customerFetch<OrderDetail>(
      `/customer/me/orders/${encodeURIComponent(orderNumber)}`,
    )
      .then(setOrder)
      .catch(() => setError(true));
  }, [orderNumber]);

  if (error) {
    return (
      <>
        <MalvaGardenAccountNav />
        <p className="text-[15px] text-[#5C5C5C]">Замовлення не знайдено.</p>
        <Link href="/account/orders" className="mt-4 inline-block text-[#5C97A8] hover:underline">
          ← До списку
        </Link>
      </>
    );
  }

  if (!order) {
    return (
      <>
        <MalvaGardenAccountNav />
        <p className="text-[15px] text-[#5C5C5C]">Завантаження…</p>
      </>
    );
  }

  return (
    <>
      <MalvaGardenAccountNav />
      <Link
        href="/account/orders"
        className="mb-4 inline-block text-[13px] font-semibold text-[#5C97A8] hover:underline"
      >
        ← Мої замовлення
      </Link>
      <div className="rounded-xl border border-[#c5d8dc] bg-white p-5">
        <h2 className="text-[20px] font-bold text-black">{order.orderNumber}</h2>
        <p className="mt-1 text-[13px] text-[#5a5a5a]">
          {new Date(order.createdAt).toLocaleString("uk-UA")}
        </p>
        <p className="mt-4 text-[18px] font-bold text-[#2f6f4e]">
          {order.totalAmount.includes("грн")
            ? order.totalAmount
            : `${order.totalAmount} грн`}
        </p>
        <dl className="mt-6 grid gap-2 text-[14px]">
          <div>
            <dt className="font-semibold text-black">Статус</dt>
            <dd>{order.orderStatus}</dd>
          </div>
          <div>
            <dt className="font-semibold text-black">Оплата</dt>
            <dd>
              {order.paymentStatus}
              {order.paymentMethod ? ` (${order.paymentMethod})` : ""}
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-black">Доставка</dt>
            <dd>
              {order.deliveryCity}, {order.deliveryAddress}
            </dd>
          </div>
        </dl>
        <h3 className="mb-3 mt-8 text-[16px] font-bold">Товари</h3>
        <ul className="space-y-2">
          {order.items.map((item, i) => (
            <li
              key={`${item.productNameSnapshot}-${i}`}
              className="flex justify-between gap-4 text-[14px]"
            >
              <span>
                {item.productNameSnapshot} × {item.quantity}
              </span>
              <span className="font-semibold">{item.total} грн</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
