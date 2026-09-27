import { orderPdfResponse } from "@/lib/order-pdf";

export const runtime = "nodejs";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const kindParam = new URL(request.url).searchParams.get("kind");
  const kind = kindParam === "receipt" ? "RECEIPT" : "INVOICE";
  return orderPdfResponse(id, kind);
}
