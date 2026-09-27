"use server";

import { revalidatePath } from "next/cache";
import { actionError } from "@/lib/errors";
import { notifyAdminOfOrder, sendOrderMailSafely } from "@/lib/email";
import { createPendingOrder } from "@/lib/orders";
import { getPublicSettings } from "@/lib/settings";
import { checkoutSchema } from "@/lib/validations/checkout";
import { orderWhatsappMessage, whatsappHref } from "@/lib/whatsapp";

export async function placeTransferOrder(input: unknown) {
  try {
    const parsed = checkoutSchema.parse(input);
    if (parsed.paymentMethod !== "TRANSFER") {
      return { ok: false as const, error: "Choose bank transfer to continue." };
    }
    const { placed } = await createPendingOrder(parsed);
    await sendOrderMailSafely(() => notifyAdminOfOrder(placed, "Transfer to confirm"));
    revalidatePath("/admin/orders");
    revalidatePath("/admin");
    return { ok: true as const, orderId: placed.id };
  } catch (error) {
    return { ok: false as const, error: actionError(error, "We could not save this order.") };
  }
}

export async function placeWhatsappOrder(input: unknown) {
  try {
    const parsed = checkoutSchema.parse(input);
    if (parsed.paymentMethod !== "WHATSAPP") {
      return { ok: false as const, error: "Choose WhatsApp to continue." };
    }
    const settings = await getPublicSettings();
    if (!settings.whatsappNumber) {
      return { ok: false as const, error: "WhatsApp ordering is not set up yet." };
    }
    const { placed } = await createPendingOrder(parsed);
    const url = whatsappHref(
      settings.whatsappNumber,
      orderWhatsappMessage({
        businessName: settings.businessName,
        customerName: placed.customerName,
        customerPhone: placed.customerPhone,
        publicRef: placed.publicRef,
        totalAmount: placed.totalAmount,
        items: placed.items,
      }),
    );
    if (!url) return { ok: false as const, error: "WhatsApp ordering is not set up yet." };
    await sendOrderMailSafely(() => notifyAdminOfOrder(placed, "WhatsApp order"));
    revalidatePath("/admin/orders");
    return { ok: true as const, orderId: placed.id, url };
  } catch (error) {
    return { ok: false as const, error: actionError(error, "We could not save this order.") };
  }
}
