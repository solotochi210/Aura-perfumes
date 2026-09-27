"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { formatNaira } from "@/lib/money";
import { STOCK_LABELS, type StockStatus } from "@/lib/constants";
import { productWhatsappMessage, whatsappHref } from "@/lib/whatsapp";
import { useCart } from "@/store/cart";
import { ProductMedia } from "@/components/storefront/product-media";

export function ProductDetail({
  product,
  whatsappNumber,
}: {
  product: {
    id: string;
    slug: string;
    name: string;
    description: string;
    price: number;
    sizeMl: number;
    category: string;
    images: string[];
    stockStatus: StockStatus;
  };
  whatsappNumber: string;
}) {
  const [active, setActive] = useState(0);
  const addItem = useCart((state) => state.addItem);
  const router = useRouter();
  const available = product.stockStatus === "IN_STOCK";
  const images = product.images.length > 0 ? product.images : [null];
  const current = images[active] ?? null;
  const href = whatsappHref(
    whatsappNumber,
    productWhatsappMessage({
      name: product.name,
      sizeMl: product.sizeMl,
      price: product.price,
    }),
  );

  function add(openCart: boolean) {
    if (!available) return;
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.images[0] ?? null,
        sizeMl: product.sizeMl,
      },
      1,
      openCart,
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
      <div>
        <div className="relative aspect-[3/4] overflow-hidden bg-cream-deep">
          <ProductMedia
            src={current}
            alt={`${product.name} perfume, ${product.sizeMl}ml`}
            sizes="(min-width: 1024px) 45vw, 100vw"
            priority
          />
        </div>
        {product.images.length > 1 ? (
          <div className="mt-3 grid grid-cols-4 gap-3">
            {product.images.map((image, index) => (
              <button
                key={image}
                type="button"
                onClick={() => setActive(index)}
                className={`relative aspect-square overflow-hidden border ${index === active ? "border-ink" : "border-transparent"}`}
                aria-label={`Show image ${index + 1} of ${product.name}`}
              >
                <ProductMedia src={image} alt="" sizes="120px" />
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <div className="lg:pt-6">
        <p className="text-xs uppercase tracking-[0.28em] text-brass-deep">{product.category}</p>
        <h1 className="mt-3 font-serif text-5xl md:text-6xl">{product.name}</h1>
        <p className="mt-4 text-lg">{formatNaira(product.price)}</p>
        <p className="mt-2 text-xs uppercase tracking-[0.16em] text-muted">
          {product.sizeMl}ml · {STOCK_LABELS[product.stockStatus]}
        </p>
        <p className="mt-8 max-w-xl text-base leading-8 text-ink-soft">{product.description}</p>
        <div className="mt-10 grid gap-3">
          <button
            type="button"
            disabled={!available}
            onClick={() => {
              add(true);
              toast.success(`${product.name} added to your cart`);
            }}
            className="h-12 bg-ink text-sm text-cream disabled:opacity-40"
          >
            Add to cart
          </button>
          <button
            type="button"
            disabled={!available}
            onClick={() => {
              add(false);
              router.push("/checkout");
            }}
            className="h-12 border border-ink text-sm disabled:opacity-40"
          >
            Buy now
          </button>
          <a
            href={href ?? "#"}
            onClick={(event) => {
              if (href) return;
              event.preventDefault();
              toast.error("WhatsApp ordering is not set up yet.");
            }}
            className="inline-flex h-12 items-center justify-center border border-line text-sm"
          >
            Order via WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
