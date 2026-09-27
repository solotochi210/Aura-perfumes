"use server";

import { revalidatePath } from "next/cache";
import { listCustomers } from "@/lib/analytics";
import { db } from "@/lib/db";
import { sendMarketingEmail, sendOrderMailSafely } from "@/lib/email";
import { actionError, type ActionResult } from "@/lib/errors";
import { nairaToKobo } from "@/lib/money";
import { requireAdmin } from "@/lib/require-admin";
import { campaignSchema, giftCardSchema } from "@/lib/validations/order";

export async function createGiftCard(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  try {
    const data = giftCardSchema.parse(input);
    const amount = nairaToKobo(data.amountNaira);
    await db.giftCard.create({
      data: {
        code: data.code.toUpperCase(),
        balance: amount,
        initial: amount,
        note: data.note ?? "",
      },
    });
    revalidatePath("/admin/customers");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: actionError(error, "The gift card could not be created.") };
  }
}

export async function sendCampaign(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  try {
    const data = campaignSchema.parse(input);
    const customers = await listCustomers();
    const audience = customers.filter((customer) => {
      if (data.segment === "REPEAT") return customer.orderCount >= 2;
      if (data.segment === "HIGH_SPEND") return customer.totalSpent >= 5000000;
      return true;
    });

    let sent = 0;
    if (data.channel === "EMAIL") {
      const emails = [...new Set(audience.map((customer) => customer.email.trim().toLowerCase()).filter(Boolean))];
      for (const email of emails) {
        await sendOrderMailSafely(() => sendMarketingEmail(email, data.subject, data.message));
        sent += 1;
      }
    } else {
      const phones = audience.map((customer) => customer.phone.replace(/\D/g, "")).filter((phone) => phone.length >= 8);
      const apiKey = process.env.TERMII_API_KEY;
      const sender = process.env.TERMII_SENDER_ID;
      if (!apiKey || !sender) {
        await db.campaign.create({
          data: {
            channel: "SMS",
            segment: data.segment,
            subject: data.subject,
            message: data.message,
            recipientCount: phones.length,
          },
        });
        revalidatePath("/admin/customers");
        return {
          ok: false,
          error: "SMS is saved, but no SMS sender is connected. Use Email to deliver this message now.",
        };
      }
      for (const phone of phones) {
        const response = await fetch("https://api.ng.termii.com/api/sms/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: phone,
            from: sender,
            sms: data.message,
            type: "plain",
            channel: "generic",
            api_key: apiKey,
          }),
        });
        if (response.ok) sent += 1;
      }
    }

    await db.campaign.create({
      data: {
        channel: data.channel,
        segment: data.segment,
        subject: data.subject,
        message: data.message,
        recipientCount: sent,
      },
    });
    revalidatePath("/admin/customers");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: actionError(error, "The campaign could not be sent.") };
  }
}
