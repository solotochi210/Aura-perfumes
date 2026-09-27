"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { actionError, type ActionResult } from "@/lib/errors";
import { markOrderPaid } from "@/lib/orders";
import { requireAdmin } from "@/lib/require-admin";
import { orderStatusSchema } from "@/lib/validations/order";

export async function updateOrderStatus(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  try {
    const data = orderStatusSchema.parse(input);
    if (data.status === "PAID") {
      const paid = await markOrderPaid(data.id);
      if (!paid) return { ok: false, error: "That order no longer exists." };
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
