import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ORDER_STATUS_LABELS, PAYMENT_LABELS, type OrderStatus } from "@/lib/constants";
import { formatDateTime, formatNaira } from "@/lib/money";
import { getPublicOrder, markOrderPaid } from "@/lib/orders";
import { verifyPaystackTransaction } from "@/lib/paystack";
import { getPublicSettings } from "@/lib/settings";
import { orderWhatsappMessage, whatsappHref } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Order",
  robots: { index: false, follow: false },
};

const tone: Record<OrderStatus, "warning" | "success" | "default" | "danger"> = {
  PENDING: "warning",
  PAID: "success",
  FULFILLED: "success",
  CANCELLED: "danger",
};

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [loaded, settings] = await Promise.all([getPublicOrder(id), getPublicSettings()]);
  let order = loaded;
  if (!order) notFound();

  if (order.status === "PENDING" && order.paymentMethod === "PAYSTACK" && order.paystackRef) {
    try {
      const verified = await verifyPaystackTransaction(order.paystackRef);
      if (verified?.status === "success" && verified.amount === order.totalAmount) {
        await markOrderPaid(order.id);
        order = (await getPublicOrder(id)) ?? order;
      }
    } catch (error) {
      console.error("Paystack verify skipped", error);
    }
  }

  const chat = whatsappHref(
    settings.whatsappNumber,
    orderWhatsappMessage({
      businessName: settings.businessName,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      publicRef: order.publicRef,
      totalAmount: order.totalAmount,
      items: order.items,
    }),
  );
  const paid = order.status === "PAID" || order.status === "FULFILLED";

  const nextStep =
    order.paymentMethod === "TRANSFER" && order.status === "PENDING"
      ? "We have your transfer notice. A receipt email arrives once the atelier confirms payment."
      : order.paymentMethod === "WHATSAPP"
        ? "Your order is saved. Continue on WhatsApp below — the atelier will reply in that chat."
        : order.status === "PAID" || order.status === "FULFILLED"
          ? "Payment is confirmed. Your invoice and receipt are ready to download."
          : "We are waiting for payment confirmation.";

  return (
    <div className="mx-auto max-w-2xl px-5 py-16">
      <p className="text-xs uppercase tracking-[0.28em] text-brass-deep">Order {order.publicRef}</p>
      <h1 className="mt-3 font-serif text-5xl">Thank you, {order.customerName}.</h1>
      <div className="mt-6 flex flex-wrap gap-2">
        <Badge tone={tone[order.status]}>{ORDER_STATUS_LABELS[order.status]}</Badge>
        <Badge>{PAYMENT_LABELS[order.paymentMethod]}</Badge>
      </div>
      <p className="mt-6 text-sm leading-7 text-ink-soft">{nextStep}</p>
      <p className="mt-2 text-xs text-muted">{formatDateTime(order.createdAt)}</p>
      <ul className="mt-10 space-y-4 border-t border-line pt-6 text-sm">
        {order.items.map((item) => (
          <li key={`${item.name}-${item.sizeMl}`} className="flex justify-between gap-4">
            <span>
              {item.name} · {item.sizeMl}ml × {item.quantity}
            </span>
            <span>{formatNaira(item.unitPrice * item.quantity)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-6 flex items-center justify-between">
        <span className="text-xs uppercase tracking-[0.16em] text-muted">Total</span>
        <span className="font-serif text-3xl">{formatNaira(order.totalAmount)}</span>
      </div>
      {order.paymentMethod === "TRANSFER" && order.status === "PENDING" && settings.accountNumber ? (
        <section className="mt-8 border border-brass/40 bg-paper p-5 text-sm leading-7">
          <p className="text-xs uppercase tracking-[0.18em] text-brass-deep">Transfer to</p>
          <p className="mt-3">{settings.bankName}</p>
          <p>{settings.accountName}</p>
          <p className="font-medium">{settings.accountNumber}</p>
        </section>
      ) : null}
      <section className="mt-8 border border-line bg-paper p-5">
        <p className="text-xs uppercase tracking-[0.18em] text-brass-deep">
          {paid ? "Receipt" : "Invoice"}
        </p>
        <p className="mt-3 text-sm leading-7 text-ink-soft">
          {settings.businessName}
          {settings.businessAddress ? ` · ${settings.businessAddress}` : ""}
        </p>
        {paid ? (
          <p className="mt-6 text-center font-serif text-2xl tracking-wide">Thank you, come again.</p>
        ) : null}
        <div className="mt-5 flex flex-wrap gap-3">
          <a
            href={`/order/${order.id}/pdf?kind=invoice`}
            className="inline-flex h-12 items-center border border-ink px-5 text-sm"
          >
            Download invoice
          </a>
          {paid ? (
            <a
              href={`/order/${order.id}/pdf?kind=receipt`}
              className="inline-flex h-12 items-center border border-ink px-5 text-sm"
            >
              Download receipt
            </a>
          ) : null}
          {chat ? (
            <a
              href={chat}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 items-center bg-ink px-5 text-sm text-cream"
            >
              Continue on WhatsApp
            </a>
          ) : null}
        </div>
      </section>
      <Link href="/shop" className="mt-10 inline-flex h-12 items-center border border-ink px-6 text-sm">
        Continue browsing
      </Link>
    </div>
  );
}
