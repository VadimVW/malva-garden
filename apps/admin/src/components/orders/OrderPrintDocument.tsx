import type { OrderDetail } from "@/lib/types";
import {
  DELIVERY_METHOD_LABELS,
  formatDate,
  formatPrice,
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
} from "@/lib/format";

function label(
  map: Record<string, string>,
  key: string | null | undefined,
): string {
  if (!key) return "—";
  return map[key] ?? key;
}

function Row({ label: l, value }: { label: string; value: string }) {
  return (
    <div className="order-print-row">
      <dt>{l}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export function OrderPrintDocument({ order }: { order: OrderDetail }) {
  return (
    <article className="order-print-doc">
      <header className="order-print-header">
        <p className="order-print-brand">Malva Garden</p>
        <h1 className="order-print-title">Замовлення {order.orderNumber}</h1>
        <p className="order-print-meta">{formatDate(order.createdAt)}</p>
      </header>

      <section className="order-print-section">
        <h2>Клієнт</h2>
        <dl>
          <Row label="Ім'я" value={order.customerName} />
          <Row label="Телефон" value={order.customerPhone} />
          <Row label="Email" value={order.customerEmail ?? "—"} />
        </dl>
        {order.comment ? (
          <p className="order-print-note">
            <span className="font-semibold">Коментар клієнта: </span>
            {order.comment}
          </p>
        ) : null}
      </section>

      <section className="order-print-section">
        <h2>Доставка</h2>
        <dl>
          <Row
            label="Спосіб"
            value={label(DELIVERY_METHOD_LABELS, order.deliveryMethod)}
          />
          <Row label="Місто" value={order.deliveryCity ?? "—"} />
          <Row label="Адреса" value={order.deliveryAddress ?? "—"} />
        </dl>
      </section>

      <section className="order-print-section">
        <h2>Товари</h2>
        <table className="order-print-table">
          <thead>
            <tr>
              <th>Назва</th>
              <th>Ціна</th>
              <th>К-сть</th>
              <th>Сума</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id}>
                <td>{item.productNameSnapshot}</td>
                <td>{formatPrice(item.priceSnapshot)}</td>
                <td className="text-center">{item.quantity}</td>
                <td>{formatPrice(item.lineTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="order-print-total">
          Разом: <strong>{formatPrice(order.totalAmount)}</strong>
        </p>
      </section>

      <section className="order-print-section order-print-section--compact">
        <h2>Оплата та статус</h2>
        <dl>
          <Row
            label="Оплата"
            value={label(PAYMENT_METHOD_LABELS, order.paymentMethod)}
          />
          <Row
            label="Статус оплати"
            value={label(PAYMENT_STATUS_LABELS, order.paymentStatus)}
          />
          <Row
            label="Статус замовлення"
            value={label(ORDER_STATUS_LABELS, order.orderStatus)}
          />
        </dl>
        {order.managerComment ? (
          <p className="order-print-note">
            <span className="font-semibold">Коментар менеджера: </span>
            {order.managerComment}
          </p>
        ) : null}
      </section>
    </article>
  );
}
