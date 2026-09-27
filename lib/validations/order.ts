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

export type ShopQuery = z.infer<typeof shopQuerySchema>;
