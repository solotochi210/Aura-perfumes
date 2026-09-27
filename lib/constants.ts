export const CATEGORIES = [
  "Floral",
  "Woody",
  "Oriental",
  "Fresh",
  "Citrus",
  "Amber",
] as const;

export const STOCK_STATUSES = ["IN_STOCK", "SOLD", "OUT_OF_STOCK"] as const;
export type StockStatus = (typeof STOCK_STATUSES)[number];

export const ORDER_STATUSES = [
  "PENDING",
  "PAID",
  "FULFILLED",
  "CANCELLED",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_METHODS = ["PAYSTACK", "TRANSFER", "WHATSAPP"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const STOCK_LABELS: Record<StockStatus, string> = {
  IN_STOCK: "In stock",
  SOLD: "Sold",
  OUT_OF_STOCK: "Out of stock",
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pending",
  PAID: "Paid",
  FULFILLED: "Fulfilled",
  CANCELLED: "Cancelled",
};

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  PAYSTACK: "Paystack",
  TRANSFER: "Bank transfer",
  WHATSAPP: "WhatsApp",
};

export const DEFAULT_SETTINGS = {
  businessName: "Aurane",
  tagline: "Giving you compliments in a bottle",
  businessEmail: "auraneessence@gmail.com",
  businessPhone: "08133905244",
  businessAddress: "3 palm avenue, Newton street, Ekosodin, Benin City, Edo",
  bankName: "",
  accountName: "",
  accountNumber: "",
  whatsappNumber: "08133905244",
};

/** Starter house details so WhatsApp, transfer, and documents work before the owner edits Settings. */
export const STARTER_HOUSE = {
  businessEmail: "hello@ojoma.local",
  businessPhone: "08030000000",
  businessAddress: "Lagos, Nigeria",
  bankName: "Your bank",
  accountName: "Ojoma",
  accountNumber: "0000000000",
  whatsappNumber: "08030000000",
};
