import { z } from "zod";

export const orderStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["PENDING", "PAID", "FULFILLED", "CANCELLED"]),
});

export const shopQuerySchema = z.object({
  q: z.string().trim().max(80).optional(),
  category: z.string().trim().max(80).optional(),
  size: z.coerce.number().int().positive().max(500).optional(),
  min: z.coerce.number().nonnegative().max(2_000_000).optional(),
  max: z.coerce.number().nonnegative().max(2_000_000).optional(),
  sort: z.enum(["newest", "price-asc", "price-desc"]).optional(),
});

export const manualOrderSchema = z.object({
  customerName: z.string().trim().min(2, "Enter a name.").max(80),
  customerPhone: z.string().trim().min(8, "Enter a phone number.").max(20),
  customerEmail: z.string().trim().max(120).optional(),
  paymentMethod: z.enum(["PAYSTACK", "TRANSFER", "WHATSAPP"]),
  channel: z.enum(["WHATSAPP", "INSTAGRAM", "STORE"]),
  productId: z.string().min(1, "Choose a perfume."),
  quantity: z.number().int().min(1).max(10),
});

export const giftCardSchema = z.object({
  code: z.string().trim().min(4, "Use at least 4 characters.").max(40),
  amountNaira: z.number().positive("Enter an amount.").max(2_000_000),
  note: z.string().trim().max(120).optional(),
});

export const campaignSchema = z.object({
  channel: z.enum(["EMAIL", "SMS"]),
  segment: z.enum(["ALL", "REPEAT", "HIGH_SPEND"]),
  subject: z.string().trim().min(2, "Add a subject.").max(120),
  message: z.string().trim().min(2, "Write a message.").max(2000),
});

export type ShopQuery = z.infer<typeof shopQuerySchema>;
