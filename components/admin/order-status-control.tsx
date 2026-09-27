"use client";

import { toast } from "sonner";
import { ORDER_STATUSES, ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/constants";
import { updateOrderStatus } from "@/app/admin/(panel)/orders/actions";

export function OrderStatusControl({ id, status }: { id: string; status: OrderStatus }) {
  return (
    <select
      aria-label="Order status"
      className="h-11 border border-line bg-paper px-3 text-sm"
      value={status}
      onChange={async (event) => {
        const next = event.target.value as OrderStatus;
        const result = await updateOrderStatus({ id, status: next });
        if (!result.ok) toast.error(result.error);
        else toast.success(`Marked ${ORDER_STATUS_LABELS[next].toLowerCase()}`);
      }}
    >
      {ORDER_STATUSES.map((item) => (
        <option key={item} value={item}>
          {ORDER_STATUS_LABELS[item]}
        </option>
      ))}
    </select>
  );
}
