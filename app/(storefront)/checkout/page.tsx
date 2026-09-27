import type { Metadata } from "next";
import { CheckoutForm } from "@/components/storefront/checkout-form";
import { getPublicSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const settings = await getPublicSettings();
  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <CheckoutForm settings={settings} />
    </div>
  );
}
