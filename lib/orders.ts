import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { db, withDatabase } from "@/lib/db";
import { notifyAdminOfOrder, sendOrderMailSafely, sendPaidReceipt } from "@/lib/email";
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

export async function createPendingOrder(input: CheckoutInput) {
  const order = await db.$transaction(async (tx) => {
    const ids = input.items.map((item) => item.productId);
    const products = await tx.product.findMany({
      where: { id: { in: ids }, stockStatus: "IN_STOCK" },
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
      };
    });

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

    return tx.order.create({
      data: {
        publicRef,
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        customerEmail: input.customerEmail.toLowerCase(),
        totalAmount: total,
        status: "PENDING",
        paymentMethod: input.paymentMethod,
        paystackRef: input.paymentMethod === "PAYSTACK" ? reference : null,
        items: { create: items },
      },
      include: placedInclude,
    });
  });

  return { record: order, placed: toPlacedOrder(order) };
}

export async function cancelOrder(orderId: string) {
  await db.$transaction(async (tx) => {
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
    return { order, changed: true };
  });

  if (!result) return null;
  if (result.changed) {
    const placed = toPlacedOrder(result.order);
    await sendOrderMailSafely(() => sendPaidReceipt(placed));
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
