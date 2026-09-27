import { formatNaira } from "@/lib/money";

export function digitsOnly(phone: string) {
  return phone.replace(/\D/g, "");
}

export function toWaMeNumber(phone: string) {
  let digits = digitsOnly(phone);
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = `234${digits.slice(1)}`;
  return digits;
}

export function whatsappHref(phone: string, message: string) {
  const number = toWaMeNumber(phone);
  if (!number) return null;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function telHref(phone: string) {
  const number = toWaMeNumber(phone);
  if (!number) return null;
  return `tel:+${number}`;
}

export function productWhatsappMessage(input: {
  name: string;
  sizeMl: number;
  price: number;
}) {
  return `Hello Aurane, I would like to order ${input.name} (${input.sizeMl}ml) at ${formatNaira(input.price)}.`;
}

export function orderWhatsappMessage(input: {
  businessName: string;
  customerName: string;
  customerPhone: string;
  publicRef: string;
  totalAmount: number;
  items: { name: string; sizeMl: number; quantity: number; unitPrice: number }[];
}) {
  const lines = input.items.map(
    (item) =>
      `• ${item.name} (${item.sizeMl}ml) × ${item.quantity} — ${formatNaira(item.unitPrice * item.quantity)}`,
  );
  return [
    `Hello ${input.businessName}, I would like to place an order.`,
    "",
    `Name: ${input.customerName}`,
    `Phone: ${input.customerPhone}`,
    "",
    ...lines,
    "",
    `Total: ${formatNaira(input.totalAmount)}`,
    `Order ref: ${input.publicRef}`,
  ].join("\n");
}

export function adminWhatsappMessage(input: {
  businessName: string;
  customerName: string;
  publicRef: string;
}) {
  return `Hello ${input.customerName}, this is ${input.businessName}. I'm writing about your order ${input.publicRef}.`;
}
