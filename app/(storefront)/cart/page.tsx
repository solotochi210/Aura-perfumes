import type { Metadata } from "next";
import { CartCheckoutBar, CartLines } from "@/components/storefront/cart-drawer";

export const metadata: Metadata = {
  title: "Cart",
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <h1 className="mb-8 font-serif text-5xl">Your cart</h1>
      <CartLines />
      <CartCheckoutBar />
    </div>
  );
}
