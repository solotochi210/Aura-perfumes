import { NextResponse } from "next/server";
import { orderPdfResponse } from "@/lib/order-pdf";
import { getVerifiedAdmin } from "@/lib/require-admin";

export const runtime = "nodejs";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getVerifiedAdmin();
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await context.params;
  const kindParam = new URL(request.url).searchParams.get("kind");
  const kind = kindParam === "receipt" ? "RECEIPT" : "INVOICE";
  return orderPdfResponse(id, kind);
}
