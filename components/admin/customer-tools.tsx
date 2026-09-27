"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createGiftCard, sendCampaign } from "@/app/admin/(panel)/customers/actions";
import { formatDate, formatNaira } from "@/lib/money";

export function CustomerTools({
  cards,
  campaigns,
}: {
  cards: { code: string; balance: number; initial: number }[];
  campaigns: { id: string; channel: string; segment: string; subject: string; recipientCount: number; createdAt: string }[];
}) {
  const [pending, setPending] = useState(false);

  return (
    <div className="mb-8 grid gap-6 lg:grid-cols-2">
      <form
        className="space-y-3 border border-line p-4"
        onSubmit={async (event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          setPending(true);
          const result = await sendCampaign({
            channel: String(form.get("channel")),
            segment: String(form.get("segment")),
            subject: String(form.get("subject")),
            message: String(form.get("message")),
          });
          setPending(false);
          if (!result.ok) {
            toast.error(result.error);
            return;
          }
          toast.success("Campaign sent");
          event.currentTarget.reset();
        }}
      >
        <h2 className="font-serif text-2xl">Campaign</h2>
        <p className="text-sm text-muted">Email goes out now. SMS sends when a Termii sender is connected.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <select name="channel" className="h-11 border border-line bg-paper px-3 text-sm" defaultValue="EMAIL">
            <option value="EMAIL">Email</option>
            <option value="SMS">SMS</option>
          </select>
          <select name="segment" className="h-11 border border-line bg-paper px-3 text-sm" defaultValue="ALL">
            <option value="ALL">All customers</option>
            <option value="REPEAT">Repeat buyers</option>
            <option value="HIGH_SPEND">Spent ₦50,000 or more</option>
          </select>
        </div>
        <input name="subject" required placeholder="Subject" className="h-11 w-full border border-line bg-paper px-3 text-sm" />
        <textarea name="message" required rows={4} placeholder="Message" className="w-full border border-line bg-paper px-3 py-2 text-sm" />
        <button type="submit" disabled={pending} className="h-11 bg-ink px-5 text-sm text-cream disabled:opacity-60">
          Send
        </button>
        {campaigns.length > 0 ? (
          <ul className="space-y-2 text-xs text-muted">
            {campaigns.map((campaign) => (
              <li key={campaign.id}>
                {campaign.channel} · {campaign.segment} · {campaign.subject} · {campaign.recipientCount} · {formatDate(new Date(campaign.createdAt))}
              </li>
            ))}
          </ul>
        ) : null}
      </form>
      <form
        className="space-y-3 border border-line p-4"
        onSubmit={async (event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          setPending(true);
          const result = await createGiftCard({
            code: String(form.get("code")),
            amountNaira: Number(form.get("amountNaira")),
            note: String(form.get("note") ?? ""),
          });
          setPending(false);
          if (!result.ok) {
            toast.error(result.error);
            return;
          }
          toast.success("Gift card created");
          event.currentTarget.reset();
        }}
      >
        <h2 className="font-serif text-2xl">Gift cards</h2>
        <p className="text-sm text-muted">Customers can enter the code at checkout. Loyalty points accrue at 1 point per ₦100 paid.</p>
        <input name="code" required placeholder="Code" className="h-11 w-full border border-line bg-paper px-3 text-sm uppercase" />
        <input name="amountNaira" required type="number" min="1" placeholder="Amount (₦)" className="h-11 w-full border border-line bg-paper px-3 text-sm" />
        <input name="note" placeholder="Note, optional" className="h-11 w-full border border-line bg-paper px-3 text-sm" />
        <button type="submit" disabled={pending} className="h-11 bg-ink px-5 text-sm text-cream disabled:opacity-60">
          Create gift card
        </button>
        {cards.length > 0 ? (
          <ul className="space-y-2 text-xs text-muted">
            {cards.map((card) => (
              <li key={card.code}>
                {card.code} · {formatNaira(card.balance)} left of {formatNaira(card.initial)}
              </li>
            ))}
          </ul>
        ) : null}
      </form>
    </div>
  );
}
