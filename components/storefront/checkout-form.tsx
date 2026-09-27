"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { checkoutSchema, type CheckoutInput } from "@/lib/validations/checkout";
import { formatNaira } from "@/lib/money";
import { cartSubtotal, useCart } from "@/store/cart";
import type { PublicSettings } from "@/lib/settings";
import { placeTransferOrder, placeWhatsappOrder } from "@/app/(storefront)/checkout/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FormValues = {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  paymentMethod: CheckoutInput["paymentMethod"];
  giftCardCode?: string;
};

export function CheckoutForm({ settings }: { settings: PublicSettings }) {
  const items = useCart((state) => state.items);
  const clear = useCart((state) => state.clear);
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(
      checkoutSchema.pick({
        customerName: true,
        customerPhone: true,
        customerEmail: true,
        paymentMethod: true,
        giftCardCode: true,
      }),
    ),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      paymentMethod: "PAYSTACK",
      giftCardCode: "",
    },
  });

  const method = form.watch("paymentMethod");
  const subtotal = cartSubtotal(items);

  if (items.length === 0) {
    return (
      <div className="py-20">
        <h1 className="font-serif text-5xl">Nothing to checkout</h1>
        <button type="button" onClick={() => router.push("/shop")} className="mt-8 h-12 bg-ink px-6 text-sm text-cream">
          Return to the shop
        </button>
      </div>
    );
  }

  async function onSubmit(values: FormValues) {
    const payload: CheckoutInput = {
      ...values,
      giftCardCode: values.giftCardCode?.trim() || undefined,
      items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
    };
    setPending(true);
    try {
      if (values.paymentMethod === "PAYSTACK") {
        const response = await fetch("/api/paystack/initialize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = (await response.json()) as { authorizationUrl?: string; error?: string };
        if (!response.ok || !data.authorizationUrl) {
          toast.error(data.error ?? "Payment could not be started.");
          return;
        }
        clear();
        window.location.href = data.authorizationUrl;
        return;
      }

      if (values.paymentMethod === "TRANSFER") {
        const result = await placeTransferOrder(payload);
        if (!result.ok) {
          toast.error(result.error);
          return;
        }
        clear();
        router.push(`/order/${result.orderId}`);
        return;
      }

      const result = await placeWhatsappOrder(payload);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      clear();
      window.open(result.url, "_blank", "noopener,noreferrer");
      router.push(`/order/${result.orderId}`);
    } finally {
      setPending(false);
    }
  }

  const submitLabel =
    method === "PAYSTACK"
      ? "Pay with Paystack"
      : method === "TRANSFER"
        ? "I've paid"
        : "Order via WhatsApp";

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-8">
        <section>
          <h1 className="font-serif text-5xl">Checkout</h1>
          <p className="mt-3 text-sm text-ink-soft">Guest checkout. No account needed.</p>
        </section>
        <section className="grid gap-4">
          <div>
            <Label htmlFor="customerName">Name</Label>
            <Input id="customerName" className="mt-2" {...form.register("customerName")} />
            <FieldError message={form.formState.errors.customerName?.message} />
          </div>
          <div>
            <Label htmlFor="customerPhone">Phone</Label>
            <Input id="customerPhone" className="mt-2" inputMode="tel" {...form.register("customerPhone")} />
            <FieldError message={form.formState.errors.customerPhone?.message} />
          </div>
          <div>
            <Label htmlFor="customerEmail">Email</Label>
            <Input id="customerEmail" className="mt-2" type="email" {...form.register("customerEmail")} />
            <FieldError message={form.formState.errors.customerEmail?.message} />
          </div>
          <div>
            <Label htmlFor="giftCardCode">Gift card</Label>
            <Input id="giftCardCode" className="mt-2" {...form.register("giftCardCode")} placeholder="Optional" />
          </div>
        </section>
        <fieldset className="space-y-3">
          <legend className="text-xs uppercase tracking-[0.18em] text-muted">Payment</legend>
          {(
            [
              ["PAYSTACK", "Card or bank", "Pay securely with Paystack."],
              ["TRANSFER", "Bank transfer", "Send the total, then tell us you have paid."],
              ["WHATSAPP", "WhatsApp", "We will open a message with your full order."],
            ] as const
          ).map(([value, title, copy]) => (
            <label key={value} className="flex cursor-pointer gap-3 border border-line bg-paper p-4">
              <input type="radio" value={value} className="mt-1" {...form.register("paymentMethod")} />
              <span>
                <span className="block text-sm">{title}</span>
                <span className="mt-1 block text-sm text-muted">{copy}</span>
              </span>
            </label>
          ))}
        </fieldset>
        {method === "TRANSFER" ? (
          <section className="border border-brass/40 bg-paper p-5 text-sm leading-7">
            <p className="text-xs uppercase tracking-[0.18em] text-brass-deep">Transfer to</p>
            <p className="mt-3">{settings.bankName || "Bank details will appear here once saved in settings."}</p>
            <p>{settings.accountName}</p>
            <p className="font-medium">{settings.accountNumber}</p>
            <p className="mt-2 text-muted">Use your name as the transfer narration.</p>
          </section>
        ) : null}
      </div>
      <aside className="h-fit border border-line bg-paper p-6">
        <h2 className="font-serif text-3xl">Order</h2>
        <ul className="mt-6 space-y-4 text-sm">
          {items.map((item) => (
            <li key={item.productId} className="flex justify-between gap-4">
              <span>
                {item.name}
                <span className="block text-xs text-muted">
                  {item.sizeMl}ml × {item.quantity}
                </span>
              </span>
              <span>{formatNaira(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
          <span className="text-xs uppercase tracking-[0.16em] text-muted">Total</span>
          <span className="font-serif text-3xl">{formatNaira(subtotal)}</span>
        </div>
        <button
          type="submit"
          disabled={pending}
          className="mt-6 h-14 w-full bg-ink text-sm text-cream disabled:opacity-50"
        >
          {pending ? "Please wait" : submitLabel}
        </button>
      </aside>
    </form>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-danger">{message}</p>;
}
