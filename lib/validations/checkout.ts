import { z } from "zod";

export const checkoutSchema = z.object({
  customerName: z.string().trim().min(2, "Enter your name.").max(80),
  customerPhone: z
    .string()
    .trim()
    .min(8, "Enter a phone number.")
    .max(20)
    .refine((value) => value.replace(/\D/g, "").length >= 8, "Enter a valid phone number."),
  customerEmail: z.email("Enter a valid email address."),
  paymentMethod: z.enum(["PAYSTACK", "TRANSFER", "WHATSAPP"]),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1).max(10),
      }),
    )
    .min(1, "Your cart is empty.")
    .max(20),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
