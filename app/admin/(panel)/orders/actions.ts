"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { actionError, type ActionResult } from "@/lib/errors";
import { cancelOrder, createManualOrder, markOrderPaid } from "@/lib/orders";
import { requireAdmin } from "@/lib/require-admin";
import { manualOrderSchema, orderStatusSchema } from "@/lib/validations/order";

export async function updateOrderStatus(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  try {
    const data = orderStatusSchema.parse(input);
    if (data.status === "PAID") {
      const paid = await markOrderPaid(data.id);
      if (!paid) return { ok: false, error: "That order no longer exists." };
      return { ok: true };
    }
    if (data.status === "CANCELLED") {
      await cancelOrder(data.id);
      revalidatePath("/admin");
      revalidatePath("/admin/orders");
      revalidatePath(`/admin/orders/${data.id}`);
      revalidatePath(`/order/${data.id}`);
      revalidatePath("/shop");
      return { ok: true };
    }
    await db.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: data.id },
        data: { status: data.status },
      });
    });
    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${data.id}`);
    revalidatePath(`/order/${data.id}`);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: actionError(error, "The order could not be updated.") };
  }
}

export async function createManualSale(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  try {
    const data = manualOrderSchema.parse(input);
    const email = data.customerEmail?.trim() ?? "";
    if (email && !email.includes("@")) return { ok: false, error: "Enter a valid email." };
    await createManualOrder({
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerEmail: email,
      paymentMethod: data.paymentMethod,
      channel: data.channel,
      items: [{ productId: data.productId, quantity: data.quantity }],
    });
    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    revalidatePath("/admin/customers");
    revalidatePath("/shop");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: actionError(error, "The sale could not be saved.") };
  }
}
