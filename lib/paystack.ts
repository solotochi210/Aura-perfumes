import { createHmac, timingSafeEqual } from "crypto";

type PaystackInit = {
  status: boolean;
  message: string;
  data?: {
    authorization_url: string;
    reference: string;
  };
};

type PaystackVerify = {
  status: boolean;
  data?: {
    status: string;
    amount: number;
    reference: string;
  };
};

function secret() {
  const value = process.env.PAYSTACK_SECRET_KEY;
  if (!value) throw new Error("Paystack is not configured.");
  return value;
}

export function verifyPaystackSignature(rawBody: string, signature: string | null) {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key || !signature) return false;
  const hash = createHmac("sha512", key).update(rawBody).digest("hex");
  const left = Buffer.from(hash);
  const right = Buffer.from(signature);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export async function initializePaystack(input: {
  email: string;
  amount: number;
  reference: string;
  callbackUrl: string;
  orderId: string;
}) {
  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: input.email,
      amount: input.amount,
      reference: input.reference,
      callback_url: input.callbackUrl,
      metadata: { orderId: input.orderId },
    }),
  });

  const payload = (await response.json()) as PaystackInit;
  if (!response.ok || !payload.status || !payload.data?.authorization_url) {
    throw new Error(payload.message || "Paystack could not start this payment.");
  }
  return payload.data;
}

export async function verifyPaystackTransaction(reference: string) {
  const response = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: { Authorization: `Bearer ${secret()}` },
      cache: "no-store",
    },
  );
  if (!response.ok) return null;
  const payload = (await response.json()) as PaystackVerify;
  if (!payload.status || !payload.data) return null;
  return payload.data;
}
