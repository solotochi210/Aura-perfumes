import { NextResponse } from "next/server";
import { renderInvoicePdf } from "@/components/pdf/invoice-document";
import { db } from "@/lib/db";
import { nextInvoiceNumber } from "@/lib/invoice";
import { formatDate, formatNaira } from "@/lib/money";
import { getPublicSettings } from "@/lib/settings";

export async function orderPdfResponse(orderId: string, kind: "INVOICE" | "RECEIPT") {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: { select: { name: true, sizeMl: true } } } } },
  });
  if (!order) return new NextResponse("Not found", { status: 404 });
  if (kind === "RECEIPT" && order.status !== "PAID" && order.status !== "FULFILLED") {
    return new NextResponse("A receipt is available after payment.", { status: 400 });
  }

  const document = await nextInvoiceNumber(order.id, kind);
  const settings = await getPublicSettings();
  const buffer = await renderInvoicePdf({
    kind,
    number: document.invoiceNumber,
    issuedAt: formatDate(document.issuedAt),
    businessName: settings.businessName,
    businessAddress: settings.businessAddress,
    businessEmail: settings.businessEmail,
    businessPhone: settings.businessPhone,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    customerEmail: order.customerEmail,
    items: order.items.map((item) => ({
      label: `${item.product.name} · ${item.product.sizeMl}ml × ${item.quantity}`,
      amount: formatNaira(item.unitPrice * item.quantity),
    })),
    total: formatNaira(order.totalAmount),
    bankName: settings.bankName,
    accountName: settings.accountName,
    accountNumber: settings.accountNumber,
  });

  const filename = kind === "RECEIPT" ? `${document.invoiceNumber}-receipt.pdf` : `${document.invoiceNumber}.pdf`;
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
