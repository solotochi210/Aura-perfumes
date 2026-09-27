"use server";

import { z } from "zod";
import { db, withDatabase } from "@/lib/db";

const pathSchema = z.string().trim().min(1).max(200);

export async function recordVisit(path: string) {
  const parsed = pathSchema.safeParse(path);
  if (!parsed.success || parsed.data.startsWith("/admin")) return;
  await withDatabase(undefined, () => db.visit.create({ data: { path: parsed.data } }));
}
