import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { db, withDatabase } from "@/lib/db";
import { notifyAdminOfOrder, sendOrderConfirmation, sendOrderMailSafely, sendPaidReceipt } from "@/lib/email";
import { nextInvoiceNumber } from "@/lib/invoice";
import { returnStock, takeStock } from "@/lib/inventory";
import { makePublicRef } from "@/lib/slug";
import type { CheckoutInput } from "@/lib/validations/checkout";
import type { PaymentMethod } from "@/lib/constants";

const placedInclude = {
  items: {
    include: {
      product: { select: { name: true, sizeMl: true } },
    },
  },
} satisfies Prisma.OrderInclude;

type OrderWithItems = Prisma.OrderGetPayload<{ include: typeof placedInclude }>;

export type PlacedOrder = {
  id: string;
  publicRef: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  items: { name: string; sizeMl: number; quantity: number; unitPrice: number }[];
};

function toPlacedOrder(order: OrderWithItems): PlacedOrder {
  return {
    id: order.id,
    publicRef: order.publicRef,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    customerEmail: order.customerEmail,
    totalAmount: order.totalAmount,
    paymentMethod: order.paymentMethod,
    items: order.items.map((item) => ({
      name: item.product.name,
      sizeMl: item.product.sizeMl,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
  };
}

type AssertNoCost = "unitCost" extends keyof PlacedOrder["items"][number] ? never : true;
const _assertNoCost: AssertNoCost = true;
void _assertNoCost;

export async function createPendingOrder(
  input: CheckoutInput,
  extras?: {
    channel?: "WEBSITE" | "WHATSAPP" | "INSTAGRAM" | "STORE";
    customerEmail?: string;
  },
) {
  const order = await db.$transaction(async (tx) => {
    const ids = input.items.map((item) => item.productId);
    const products = await tx.product.findMany({
      where: { id: { in: ids } },
    });
    if (products.length !== new Set(ids).size) {
      throw new Error("One or more perfumes are no longer available.");
    }

    const byId = new Map(products.map((product) => [product.id, product]));
    let total = 0;
    const items = input.items.map((item) => {
      const product = byId.get(item.productId);
      if (!product) throw new Error("One or more perfumes are no longer available.");
      total += product.price * item.quantity;
      return {
        productId: product.id,
        quantity: item.quantity,
        unitPrice: product.price,
        unitCost: product.costPrice,
        name: product.name,
      };
    });

    const giftCode = input.giftCardCode?.trim();
    if (giftCode) {
      const card = await tx.giftCard.findUnique({ where: { code: giftCode.toUpperCase() } });
      if (!card || card.balance <= 0) throw new Error("That gift card cannot be used.");
      const discount = Math.min(card.balance, total);
      const spent = await tx.giftCard.updateMany({
        where: { id: card.id, balance: { gte: discount } },
        data: { balance: { decrement: discount } },
      });
      if (spent.count !== 1) throw new Error("That gift card cannot be used.");
      total -= discount;
    }

    if (total > 2_000_000_000) {
      throw new Error("This order total is too large.");
    }

    let publicRef = makePublicRef();
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const existing = await tx.order.findUnique({ where: { publicRef } });
      if (!existing) break;
      publicRef = makePublicRef();
    }

    const reference = `ojoma_${crypto.randomUUID().replace(/-/g, "").slice(0, 18)}`;

    const created = await tx.order.create({
      data: {
        publicRef,
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        customerEmail: (extras?.customerEmail ?? input.customerEmail).toLowerCase(),
        totalAmount: total,
        status: "PENDING",
        paymentMethod: input.paymentMethod,
        channel: extras?.channel ?? (input.paymentMethod === "WHATSAPP" ? "WHATSAPP" : "WEBSITE"),
        paystackRef: input.paymentMethod === "PAYSTACK" ? reference : null,
        items: {
          create: items.map(({ name: _name, ...item }) => item),
        },
      },
      include: placedInclude,
    });

    for (const item of items) {
      await takeStock(tx, item.productId, item.quantity, `Sold ${item.quantity} on ${publicRef}`);
    }

    return created;
  });

  await rememberCustomer(order);
  const invoice = await nextInvoiceNumber(order.id, "INVOICE");
  const placed = toPlacedOrder(order);
  if (placed.customerEmail) {
    await sendOrderMailSafely(() => sendOrderConfirmation(placed, invoice.invoiceNumber));
  }
  revalidatePath("/shop");
  revalidatePath("/");
  return { record: order, placed };
}

export async function createManualOrder(input: {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  paymentMethod: PaymentMethod;
  channel: "WHATSAPP" | "INSTAGRAM" | "STORE";
  items: { productId: string; quantity: number }[];
}) {
  const email = input.customerEmail.trim().toLowerCase();
  const placed = await createPendingOrder(
    {
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      customerEmail: email || "orders@auraneessence.com",
      paymentMethod: input.paymentMethod,
      items: input.items,
    },
    { channel: input.channel, customerEmail: email },
  );
  await markOrderPaid(placed.record.id);
  return placed.record.id;
}

async function rememberCustomer(order: {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
}) {
  const phone = order.customerPhone.replace(/\D/g, "");
  if (!phone) return;
  await db.customer.upsert({
    where: { phone },
    update: { name: order.customerName, email: order.customerEmail },
    create: { name: order.customerName, phone, email: order.customerEmail },
  });
}

export async function cancelOrder(orderId: string) {
  await db.$transaction(async (tx) => {
    const existing = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!existing || existing.status === "CANCELLED") return;
    for (const item of existing.items) {
      await returnStock(tx, item.productId, item.quantity, `Returned ${item.quantity} from ${existing.publicRef}`);
    }
    await tx.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED" },
    });
  });
}

export async function markOrderPaid(orderId: string) {
  const result = await db.$transaction(async (tx) => {
    const existing = await tx.order.findUnique({
      where: { id: orderId },
      include: placedInclude,
    });
    if (!existing) return null;
    if (existing.status === "CANCELLED") return { order: existing, changed: false };
    if (existing.status === "PAID" || existing.status === "FULFILLED") {
      return { order: existing, changed: false };
    }
    const order = await tx.order.update({
      where: { id: orderId },
      data: { status: "PAID" },
      include: placedInclude,
    });
    const phone = order.customerPhone.replace(/\D/g, "");
    if (phone) {
      const points = Math.floor(order.totalAmount / 10000);
      await tx.customer.upsert({
        where: { phone },
        update: {
          name: order.customerName,
          email: order.customerEmail,
          points: { increment: points },
        },
        create: {
          name: order.customerName,
          phone,
          email: order.customerEmail,
          points,
        },
      });
    }
    return { order, changed: true };
  });

  if (!result) return null;
  if (result.changed) {
    const placed = toPlacedOrder(result.order);
    await sendOrderMailSafely(async () => {
      const receipt = await nextInvoiceNumber(orderId, "RECEIPT");
      await sendPaidReceipt(placed, receipt.invoiceNumber);
    });
    await sendOrderMailSafely(() => notifyAdminOfOrder(placed, "Payment received"));
    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath(`/order/${orderId}`);
  }
  return toPlacedOrder(result.order);
}

export async function markPaidByReference(reference: string, amountKobo: number) {
  const existing = await db.order.findUnique({ where: { paystackRef: reference } });
  if (!existing) return { ok: false as const, reason: "missing" as const };
  if (existing.totalAmount !== amountKobo) {
    return { ok: false as const, reason: "amount" as const };
  }
  await markOrderPaid(existing.id);
  return { ok: true as const, orderId: existing.id };
}

export async function getPublicOrder(id: string) {
  const order = await withDatabase(null, () =>
    db.order.findUnique({
      where: { id },
      include: placedInclude,
    }),
  );
  if (!order) return null;
  return {
    ...toPlacedOrder(order),
    status: order.status,
    paystackRef: order.paystackRef,
    createdAt: order.createdAt,
  };
}
