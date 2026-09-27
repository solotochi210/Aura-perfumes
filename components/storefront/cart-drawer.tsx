"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { formatNaira } from "@/lib/money";
import { cartSubtotal, useCart } from "@/store/cart";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { ProductMedia } from "@/components/storefront/product-media";

export function CartLines() {
  const items = useCart((state) => state.items);
  const setQuantity = useCart((state) => state.setQuantity);
  const removeItem = useCart((state) => state.removeItem);

  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="font-serif text-3xl">Your cart is empty</p>
        <p className="mt-3 text-sm text-muted">The collection is waiting.</p>
        <Link href="/shop" className="mt-8 inline-flex h-12 items-center bg-ink px-6 text-sm text-cream">
          Browse perfumes
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {items.map((item) => (
        <div key={item.productId} className="flex gap-4 border-b border-line pb-6">
          <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-cream-deep">
            <ProductMedia
              src={item.image}
              alt={`${item.name} perfume, ${item.sizeMl}ml`}
              sizes="80px"
            />
          </div>
          <div className="flex flex-1 flex-col">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Link href={`/product/${item.slug}`} className="font-serif text-xl">
                  {item.name}
                </Link>
                <p className="text-xs uppercase tracking-[0.16em] text-muted">{item.sizeMl}ml</p>
              </div>
              <p className="text-sm">{formatNaira(item.price * item.quantity)}</p>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center border border-line">
                <button
                  type="button"
                  className="inline-flex h-11 w-11 items-center justify-center"
                  aria-label={`Decrease ${item.name}`}
                  onClick={() => setQuantity(item.productId, item.quantity - 1)}
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-6 text-center text-sm">{item.quantity}</span>
                <button
                  type="button"
                  className="inline-flex h-11 w-11 items-center justify-center"
                  aria-label={`Increase ${item.name}`}
                  onClick={() => setQuantity(item.productId, item.quantity + 1)}
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
              <button
                type="button"
                aria-label={`Remove ${item.name}`}
                onClick={() => removeItem(item.productId)}
                className="text-muted hover:text-danger"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
      <div className="flex items-center justify-between pt-2">
        <span className="text-xs uppercase tracking-[0.18em] text-muted">Subtotal</span>
        <span className="font-serif text-2xl">{formatNaira(cartSubtotal(items))}</span>
      </div>
    </div>
  );
}

export function CartCheckoutBar() {
  const items = useCart((state) => state.items);
  if (items.length === 0) return null;
  return (
    <Link href="/checkout" className="mt-6 inline-flex h-12 w-full items-center justify-center bg-ink text-sm text-cream">
      Checkout
    </Link>
  );
}

export function CartDrawer() {
  const isOpen = useCart((state) => state.isOpen);
  const open = useCart((state) => state.open);
  const close = useCart((state) => state.close);
  const items = useCart((state) => state.items);

  return (
    <Sheet open={isOpen} onOpenChange={(next) => (next ? open() : close())}>
      <SheetContent aria-describedby={undefined}>
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <SheetTitle className="inline-flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 shrink-0" aria-hidden />
            Cart
          </SheetTitle>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <CartLines />
        </div>
        {items.length > 0 ? (
          <div className="grid gap-2 border-t border-line p-6">
            <Link
              href="/checkout"
              onClick={close}
              className="inline-flex h-12 items-center justify-center bg-ink text-sm text-cream"
            >
              Checkout
            </Link>
            <Link
              href="/cart"
              onClick={close}
              className="inline-flex h-12 items-center justify-center border border-line text-sm"
            >
              Review cart
            </Link>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
