import { z } from "zod";

const money = z.number().positive("Enter an amount.").max(2_000_000);

export const productFormSchema = z.object({
  name: z.string().trim().min(2, "Name is too short.").max(120),
  description: z
    .string()
    .trim()
    .min(10, "Add a fuller description.")
    .max(5000),
  priceNaira: money,
  costPriceNaira: z.number().nonnegative("Cost cannot be negative.").max(2_000_000),
  stockStatus: z.enum(["IN_STOCK", "SOLD", "OUT_OF_STOCK"]),
  stockQty: z.number().int().nonnegative("Stock cannot be negative.").max(100000),
  color: z.string().trim().max(40).optional(),
  texture: z.string().trim().max(40).optional(),
  images: z
    .array(
      z
        .url("Image address is invalid.")
        .refine((value) => value.startsWith("https://"), "Images must use https."),
    )
    .max(8),
  category: z.string().trim().min(2, "Add a category.").max(40),
  sizeMl: z.number().int().positive("Enter a size in ml.").max(500),
  featured: z.boolean(),
});

export const productEditSchema = productFormSchema.extend({
  id: z.string().min(1),
});

export const inlineProductSchema = z.object({
  id: z.string().min(1),
  priceNaira: money.optional(),
  costPriceNaira: z.number().nonnegative().max(2_000_000).optional(),
  stockStatus: z.enum(["IN_STOCK", "SOLD", "OUT_OF_STOCK"]).optional(),
  featured: z.boolean().optional(),
});

export type ProductFormInput = z.infer<typeof productFormSchema>;
export type ProductEditInput = z.infer<typeof productEditSchema>;
