import { NextResponse } from "next/server";
import { checkoutSchema } from "@/lib/validations/checkout";
import { cancelOrder, createPendingOrder } from "@/lib/orders";
import { initializePaystack } from "@/lib/paystack";
import { getSiteUrl } from "@/lib/utils";

export async function POST(request: Request) {
  const json: unknown = await request.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(json);
  if (!parsed.success || parsed.data.paymentMethod !== "PAYSTACK") {
    return NextResponse.json({ error: "Check the checkout details and try again." }, { status: 400 });
  }

  try {
    const { record, placed } = await createPendingOrder(parsed.data);
    if (!record.paystackRef) {
      return NextResponse.json({ error: "Payment could not be started." }, { status: 500 });
    }
    try {
      const payment = await initializePaystack({
        email: placed.customerEmail,
        amount: placed.totalAmount,
        reference: record.paystackRef,
        callbackUrl: `${getSiteUrl()}/order/${placed.id}`,
        orderId: placed.id,
      });
      return NextResponse.json({ authorizationUrl: payment.authorization_url, orderId: placed.id });
    } catch (error) {
      await cancelOrder(placed.id);
      const message = error instanceof Error ? error.message : "Payment could not be started.";
      return NextResponse.json({ error: message }, { status: 502 });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "We could not save this order.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}