"use client";

import { toast } from "sonner";
import { useCart } from "@/store/cart";
import { whatsappHref, productWhatsappMessage } from "@/lib/whatsapp";

export function PurchaseButtons({
  product,
  whatsappNumber,
  layout = "card",
}: {
  product: {
    id: string;
    slug: string;
    name: string;
    price: number;
    sizeMl: number;
    images: string[];
    stockStatus: "IN_STOCK" | "SOLD" | "OUT_OF_STOCK";
  };
  whatsappNumber: string;
  layout?: "card" | "detail";
}) {
  const addItem = useCart((state) => state.addItem);
  const available = product.stockStatus === "IN_STOCK";
  const href = whatsappHref(
    whatsappNumber,
    productWhatsappMessage({
      name: product.name,
      sizeMl: product.sizeMl,
      price: product.price,
    }),
  );

  function add() {
    if (!available) return;
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.images[0] ?? null,
      sizeMl: product.sizeMl,
    });
    toast.success(`${product.name} added to your cart`);
  }

  function onWhatsapp(event: React.MouseEvent<HTMLAnchorElement>) {
    if (href) return;
    event.preventDefault();
    toast.error("WhatsApp ordering is not set up yet.");
  }

  const stack = layout === "detail" ? "sm:grid-cols-2" : "grid-cols-1";

  return (
    <div className={`grid gap-2 ${stack}`}>
      <button
        type="button"
        onClick={add}
        disabled={!available}
        className="h-12 bg-ink text-sm text-cream transition hover:bg-ink-soft disabled:opacity-40"
      >
        Add to cart
      </button>
      <a
        href={href ?? "#"}
        onClick={onWhatsapp}
        target={href ? "_blank" : undefined}
        rel={href ? "noreferrer" : undefined}
        className="inline-flex h-12 items-center justify-center border border-ink/20 text-sm transition hover:border-ink"
      >
        Buy on WhatsApp
      </a>
    </div>
  );
}
