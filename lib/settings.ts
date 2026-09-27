import { db, withDatabase } from "@/lib/db";
import { DEFAULT_SETTINGS } from "@/lib/constants";

export type PublicSettings = typeof DEFAULT_SETTINGS;

const publicSettingsSelect = {
  businessName: true,
  tagline: true,
  businessEmail: true,
  businessPhone: true,
  businessAddress: true,
  bankName: true,
  accountName: true,
  accountNumber: true,
  whatsappNumber: true,
} as const;

export async function getPublicSettings(): Promise<PublicSettings> {
  const row = await withDatabase(null, () =>
    db.settings.findUnique({
      where: { id: "default" },
      select: publicSettingsSelect,
    }),
  );
  return row ?? DEFAULT_SETTINGS;
}
