"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { actionError, type ActionResult } from "@/lib/errors";
import { requireAdmin } from "@/lib/require-admin";
import { settingsSchema } from "@/lib/validations/settings";

export async function saveSettings(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  try {
    const data = settingsSchema.parse(input);
    await db.$transaction(async (tx) => {
      await tx.settings.upsert({
        where: { id: "default" },
        update: data,
        create: { id: "default", ...data },
      });
    });
    revalidatePath("/", "layout");
    revalidatePath("/admin/settings");
    revalidatePath("/checkout");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: actionError(error, "Settings could not be saved.") };
  }
}
