import { NextResponse } from "next/server";
import { markPaidByReference } from "@/lib/orders";
import { verifyPaystackSignature } from "@/lib/paystack";

type PaystackEvent = {
  event?: string;
  data?: {
    reference?: string;
    amount?: number;
    status?: string;
  };
};

export async function POST(request: Request) {
  const raw = await request.text();
  const signature = request.headers.get("x-paystack-signature");
  if (!verifyPaystackSignature(raw, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: PaystackEvent;
  try {
    event = JSON.parse(raw) as PaystackEvent;
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (event.event !== "charge.success" || event.data?.status !== "success") {
    return NextResponse.json({ received: true });
  }

  const reference = event.data.reference;
  const amount = event.data.amount;
  if (!reference || typeof amount !== "number") {
    return NextResponse.json({ error: "Incomplete payload" }, { status: 400 });
  }

  const result = await markPaidByReference(reference, amount);
  if (!result.ok && result.reason === "amount") {
    return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
  }
  return NextResponse.json({ received: true });
}
