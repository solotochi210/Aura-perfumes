"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createManualSale } from "@/app/admin/(panel)/orders/actions";

export function ManualOrderForm({
  products,
}: {
  products: { id: string; name: string; stockQty: number; images: string[] }[];
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [productId, setProductId] = useState("");

  return (
    <form
      className="mb-8 grid gap-3 border border-line p-4 md:grid-cols-2"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        setPending(true);
        if (!productId) {
          setPending(false);
          toast.error("Choose a perfume.");
          return;
        }
        const result = await createManualSale({
          customerName: String(form.get("customerName")),
          customerPhone: String(form.get("customerPhone")),
          customerEmail: String(form.get("customerEmail") ?? ""),
          paymentMethod: String(form.get("paymentMethod")),
          channel: String(form.get("channel")),
          productId,
          quantity: Number(form.get("quantity")),
        });
        setPending(false);
        if (!result.ok) {
          toast.error(result.error);
          return;
        }
        toast.success("Sale recorded");
        event.currentTarget.reset();
        setProductId("");
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
      <div className="md:col-span-2">
        <p className="mb-2 text-xs uppercase tracking-[0.16em] text-muted">Choose a perfume</p>
        {products.length === 0 ? (
          <p className="border border-dashed border-line px-4 py-8 text-center text-sm text-muted">
            No bottles are in stock.
          </p>
        ) : (
          <div className="grid max-h-80 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => {
              const image = product.images[0];
              const selected = productId === product.id;
              return (
                <button
                  key={product.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setProductId(product.id)}
                  className={
                    selected
                      ? "flex items-center gap-2 border border-ink bg-cream p-2 text-left"
                      : "flex items-center gap-2 border border-line p-2 text-left"
                  }
                >
                  <span className="relative h-14 w-11 shrink-0 overflow-hidden bg-[#f3ece3]">
                    {image ? (
                      <Image
                        src={image}
                        alt={product.name}
                        fill
                        unoptimized
                        sizes="44px"
                        className="object-cover"
                      />
                    ) : (
                      <span className="flex h-full items-center justify-center font-serif text-lg text-ink/70">
                        {product.name.slice(0, 1)}
                      </span>
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm">{product.name}</span>
                    <span className="block text-[11px] text-muted">{product.stockQty} left</span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
      <input name="quantity" type="number" min={1} max={10} defaultValue={1} className="h-11 border border-line bg-paper px-3 text-sm" />
      <button type="submit" disabled={pending} className="h-11 bg-ink px-5 text-sm text-cream disabled:opacity-60 md:col-span-2">
        Save sale
      </button>
    </form>
  );
}
