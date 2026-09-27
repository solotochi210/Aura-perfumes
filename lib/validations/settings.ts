import { z } from "zod";

export const settingsSchema = z.object({
  businessName: z.string().trim().min(2, "Enter the business name.").max(80),
  tagline: z.string().trim().max(160),
  businessEmail: z.union([z.email("Enter a valid email."), z.literal("")]),
  businessPhone: z.string().trim().max(30),
  businessAddress: z.string().trim().max(300),
  bankName: z.string().trim().max(80),
  accountName: z.string().trim().max(80),
  accountNumber: z.string().trim().max(20),
  whatsappNumber: z.string().trim().max(20),
});

export type SettingsInput = z.infer<typeof settingsSchema>;
