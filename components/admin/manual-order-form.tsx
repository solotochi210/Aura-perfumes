"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createManualSale } from "@/app/admin/(panel)/orders/actions";

export function ManualOrderForm({
  products,
}: {
  products: { id: string; name: string; stockQty: number }[];
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <form
      className="mb-8 grid gap-3 border border-line p-4 md:grid-cols-2"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        setPending(true);
        const result = await createManualSale({
          customerName: String(form.get("customerName")),
          customerPhone: String(form.get("customerPhone")),
          customerEmail: String(form.get("customerEmail") ?? ""),
          paymentMethod: String(form.get("paymentMethod")),
          channel: String(form.get("channel")),
          productId: String(form.get("productId")),
          quantity: Number(form.get("quantity")),
        });
        setPending(false);
        if (!result.ok) {
          toast.error(result.error);
          return;
        }
        toast.success("Sale recorded");
        event.currentTarget.reset();
        router.refresh();
      }}
    >
      <div className="md:col-span-2">
        <h2 className="font-serif text-2xl">Record a sale</h2>
        <p className="mt-1 text-sm text-muted">Instagram, WhatsApp, or the shop floor. Stock updates and the customer is kept.</p>
      </div>
      <input name="customerName" required placeholder="Customer name" className="h-11 border border-line bg-paper px-3 text-sm" />
      <input name="customerPhone" required placeholder="Phone" className="h-11 border border-line bg-paper px-3 text-sm" />
      <input name="customerEmail" type="email" placeholder="Email, optional" className="h-11 border border-line bg-paper px-3 text-sm" />
      <select name="channel" className="h-11 border border-line bg-paper px-3 text-sm" defaultValue="WHATSAPP">
        <option value="WHATSAPP">WhatsApp</option>
        <option value="INSTAGRAM">Instagram</option>
        <option value="STORE">Physical store</option>
      </select>
      <select name="paymentMethod" className="h-11 border border-line bg-paper px-3 text-sm" defaultValue="TRANSFER">
        <option value="TRANSFER">Bank transfer</option>
        <option value="PAYSTACK">Paystack</option>
        <option value="WHATSAPP">WhatsApp</option>
      </select>
      <select name="productId" required className="h-11 border border-line bg-paper px-3 text-sm" defaultValue="">
        <option value="" disabled>
          Choose a perfume
        </option>
        {products.map((product) => (
          <option key={product.id} value={product.id}>
            {product.name} · {product.stockQty} left
          </option>
        ))}
      </select>
      <input name="quantity" type="number" min={1} max={10} defaultValue={1} className="h-11 border border-line bg-paper px-3 text-sm" />
      <button type="submit" disabled={pending} className="h-11 bg-ink px-5 text-sm text-cream disabled:opacity-60 md:col-span-2">
        Save sale
      </button>
    </form>
  );
}
