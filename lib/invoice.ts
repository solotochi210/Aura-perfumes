import { db } from "@/lib/db";

export async function nextInvoiceNumber(orderId: string, kind: "INVOICE" | "RECEIPT") {
  return db.$transaction(async (tx) => {
    const existing = await tx.invoice.findUnique({
      where: { orderId_kind: { orderId, kind } },
    });
    if (existing) return existing;

    const sequence = await tx.invoiceSequence.upsert({
      where: { id: "default" },
      update: { current: { increment: 1 } },
      create: { id: "default", current: 1001 },
    });

    const year = new Date().getFullYear();
    const invoiceNumber = `OJ-${year}-${String(sequence.current).padStart(4, "0")}`;

    return tx.invoice.create({
      data: {
        orderId,
        kind,
        invoiceNumber,
        pdfUrl: `/admin/orders/${orderId}/pdf?kind=${kind.toLowerCase()}`,
      },
    });
  });
}
