import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { OrderStatusControl } from "@/components/admin/order-status-control";
import { ORDER_STATUS_LABELS, PAYMENT_LABELS } from "@/lib/constants";
import { formatDateTime, formatNaira } from "@/lib/money";
import { getPublicSettings } from "@/lib/settings";
import { adminWhatsappMessage, telHref, whatsappHref } from "@/lib/whatsapp";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [order, settings] = await Promise.all([
    db.order.findUnique({
      where: { id },
      include: { items: { include: { product: { select: { name: true, sizeMl: true } } } } },
    }),
    getPublicSettings(),
  ]);
  if (!order) notFound();

  const whatsapp = whatsappHref(
    order.customerPhone,
    adminWhatsappMessage({
      businessName: settings.businessName,
      customerName: order.customerName,
      publicRef: order.publicRef,
    }),
  );
  const call = telHref(order.customerPhone);
  const profit = order.items.reduce(
    (sum, item) => sum + (item.unitPrice - item.unitCost) * item.quantity,
    0,
  );

  return (
    <div className="max-w-3xl">
      <Link href="/admin/orders" className="text-xs uppercase tracking-[0.16em] text-brass-deep">
        All orders
      </Link>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl">{order.publicRef}</h1>
          <p className="mt-2 text-sm text-muted">{formatDateTime(order.createdAt)}</p>
        </div>
        <Badge>{ORDER_STATUS_LABELS[order.status]}</Badge>
      </div>
      <section className="mt-8 grid gap-2 text-sm">
        <p className="font-medium">{order.customerName}</p>
        <p>{order.customerPhone}</p>
        <p>{order.customerEmail}</p>
        <p className="text-muted">{PAYMENT_LABELS[order.paymentMethod]}</p>
      </section>
      <div className="mt-6 flex flex-wrap gap-3">
        {whatsapp ? (
          <a
            href={whatsapp}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 items-center border border-ink px-4 text-sm"
          >
            Message on WhatsApp
          </a>
        ) : null}
        {call ? (
          <a href={call} className="inline-flex h-11 items-center border border-line px-4 text-sm">
            Call
          </a>
        ) : null}
        <a
          href={`/admin/orders/${order.id}/pdf?kind=invoice`}
          className="inline-flex h-11 items-center border border-line px-4 text-sm"
        >
          Invoice PDF
        </a>
        {order.status === "PAID" || order.status === "FULFILLED" ? (
          <a
            href={`/admin/orders/${order.id}/pdf?kind=receipt`}
            className="inline-flex h-11 items-center border border-line px-4 text-sm"
          >
            Receipt PDF
          </a>
        ) : null}
      </div>
      <div className="mt-8">
        <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-muted">Update status</p>
        <OrderStatusControl id={order.id} status={order.status} />
        <p className="mt-2 text-xs text-muted">
          Mark a transfer as paid once the money has arrived. Mark fulfilled when the bottle has gone out.
        </p>
      </div>
      <ul className="mt-8 space-y-4 border-t border-line pt-6 text-sm">
        {order.items.map((item) => (
          <li key={item.id} className="flex justify-between gap-4">
            <span>
              {item.product.name} · {item.product.sizeMl}ml × {item.quantity}
            </span>
            <span>{formatNaira(item.unitPrice * item.quantity)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-6 flex items-center justify-between">
        <span>Total</span>
        <span className="font-serif text-3xl">{formatNaira(order.totalAmount)}</span>
      </div>
      <p className="mt-2 text-sm text-muted">Profit on this order {formatNaira(profit)}</p>
    </div>
  );
}
